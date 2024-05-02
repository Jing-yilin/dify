"""Abstract interface for document loader implementations."""

import logging
from collections.abc import Iterator
from typing import Optional

logger = logging.getLogger(__name__)

from core.rag.extractor.blod.blod import Blob
from core.rag.extractor.extractor_base import BaseExtractor
from core.rag.models.document import Document
from extensions.ext_storage import storage


class PdfExtractor(BaseExtractor):
    """Load pdf files.


    Args:
        file_path: Path to the file to load.
    """

    def __init__(self, file_path: str, file_cache_key: Optional[str] = None):
        """Initialize with file path."""
        self._file_path = file_path
        self._file_cache_key = file_cache_key

    def extract(self) -> list[Document]:
        plaintext_file_key = ""
        plaintext_file_exists = False
        if self._file_cache_key:
            try:
                text = storage.load(self._file_cache_key).decode("utf-8")
                plaintext_file_exists = True
                return [Document(page_content=text)]
            except FileNotFoundError:
                pass
        documents = list(self.load())
        text_list = []
        for document in documents:
            text_list.append(document.page_content)
        text = "\n\n".join(text_list)

        # save plaintext file for caching
        if not plaintext_file_exists and plaintext_file_key:
            storage.save(plaintext_file_key, text.encode("utf-8"))

        return documents

    def load(
        self,
    ) -> Iterator[Document]:
        """Lazy load given path as pages."""
        blob = Blob.from_path(self._file_path)
        yield from self.parse(blob)

    def parse(self, blob: Blob) -> Iterator[Document]:
        """Lazily parse the blob."""
        import pypdfium2

        with blob.as_bytes_io() as file_path:
            pdf_reader = pypdfium2.PdfDocument(file_path, autoclose=True)

            for page_number, page in enumerate(pdf_reader):
                try:
                    text_page = page.get_textpage()
                    content = text_page.get_text_range()
                    text_page.close()
                    page.close()
                    metadata = {"source": blob.source, "page": page_number}
                    if content.strip() == "":
                        logger.error(
                            "Empty page parsed by pypdfium2, trying parsing by surya ocr"
                        )
                        # try:
                        content = self.parse_page_by_surya_ocr(
                            blob=blob, page_number=page_number
                        )
                        metadata = {"source": blob.source, "page": page_number}
                        # except Exception as e:
                        #     logger.error(f"Error parsing page {page_number} by surya ocr: {e}")
                    logger.info(f"content = {content}")
                    yield Document(page_content=content, metadata=metadata)
                finally:
                    # pdf_reader.close()
                    pass

    def parse_page_by_surya_ocr(
        self,
        blob: Blob,
        page_number: int,
        langs: list[str] = ["zh"],
    ) -> str:
        import pathlib

        import pdf2image
        from surya.model.detection import segformer
        from surya.model.recognition.model import load_model
        from surya.model.recognition.processor import load_processor
        from surya.ocr import run_ocr

        core_folder = pathlib.Path(__file__).parent.parent.parent

        images = pdf2image.convert_from_bytes(
            blob.as_bytes(),
            first_page=page_number + 1,
            last_page=page_number + 1,
            fmt="jpeg",
        )

        model_path = core_folder / "huggingface_model" / "Surya Detection Model.safetensors"
        det_processor, det_model = segformer.load_processor(model_path), segformer.load_model(model_path)
        rec_model, rec_processor = load_model(), load_processor()

        predictions = run_ocr(
            images, [langs], det_model, det_processor, rec_model, rec_processor
        )

        text = "\n".join([line.text for line in predictions[0].text_lines])

        return text
