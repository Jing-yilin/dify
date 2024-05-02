from typing import Any, Literal

from pydantic.v1 import BaseModel
from pydantic.v1.version import VERSION as PYDANTIC_VERSION

PYDANTIC_V2 = PYDANTIC_VERSION.startswith("2.")

if PYDANTIC_V2:
    from pydantic_core import Url as Url

    def _model_dump(
        model: BaseModel, mode: Literal["json", "python"] = "json", **kwargs: Any
    ) -> Any:
        return model.model_dump(mode=mode, **kwargs)
else:
    from pydantic.v1 import AnyUrl as Url  # noqa: F401

    def _model_dump(
        model: BaseModel, mode: Literal["json", "python"] = "json", **kwargs: Any
    ) -> Any:
        return model.dict(**kwargs)
