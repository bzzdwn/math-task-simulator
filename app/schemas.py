from pydantic import BaseModel
from .models import Convergence, TaskTypeEnum

class TaskPublic(BaseModel):
    id: int
    instruction: str
    problem_latex: str
    hint: str
    task_type: TaskTypeEnum

    class Config:
        orm_mode = True # В старых версиях Pydantic, в v2 - from_attributes = True

class AnswerRequest(BaseModel):
    task_id: int
    user_answer: str

class AnswerResponse(BaseModel):
    is_correct: bool