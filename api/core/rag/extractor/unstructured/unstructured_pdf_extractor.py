import logging
import os

from core.rag.extractor.extractor_base import BaseExtractor
from core.rag.models.document import Document

logger = logging.getLogger(__name__)


class UnstructuredPdfExtractor(BaseExtractor):
    """Loader that uses unstructured to load word documents.
    """

    def __init__(
            self,
            file_path: str,
            api_url: str,
    ):
        """Initialize with file path."""
        self._file_path = file_path
        self._api_url = api_url

    def extract(self) -> list[Document]:
        from unstructured.__version__ import __version__ as __unstructured_version__
        from unstructured.file_utils.filetype import FileType, detect_filetype

        unstructured_version = tuple(
            [int(x) for x in __unstructured_version__.split(".")]
        )
        # check the file extension
        try:
            import magic  # noqa: F401

            is_pdf = detect_filetype(self._file_path) == FileType.PDF
        except ImportError:
            _, extension = os.path.splitext(str(self._file_path))
            is_pdf = extension == ".pdf"

        if is_pdf and unstructured_version < (0, 4, 11):
            raise ValueError(
                f"You are on unstructured version {__unstructured_version__}. "
                "Partitioning .pdf files is only supported in unstructured>=0.4.11. "
                "Please upgrade the unstructured package and try again."
            )

        if is_pdf:
            from unstructured.partition.pdf import _partition_pdf_or_image_with_ocr

            elements = _partition_pdf_or_image_with_ocr(filename=self._file_path)

        from unstructured.chunking.title import chunk_by_title
        chunks = chunk_by_title(elements, max_characters=2000, combine_text_under_n_chars=2000)
        documents = []
        for chunk in chunks:
            text = chunk.text.strip()
            documents.append(Document(page_content=text))
        return documents
