from pydantic.v1 import BaseModel


class VariableSelector(BaseModel):
    """
    Variable Selector.
    """
    variable: str
    value_selector: list[str]
