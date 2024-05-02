import pydantic
from pydantic.v1 import BaseModel


def dump_model(model: BaseModel) -> dict:
    if hasattr(pydantic, 'model_dump'):
        return pydantic.model_dump(model)
    else:
        return model.dict()
