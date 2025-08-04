from pydantic import BaseModel
from .models import Convergence

class TaskPublic(BaseModel):
    id: int
    problem_latex: str

    class Config:
        orm_mode = True # В старых версиях Pydantic, в v2 - from_attributes = True

class AnswerRequest(BaseModel):
    task_id: int
    user_answer: Convergence # Ожидаем только 'сходится' или 'расходится'

class AnswerResponse(BaseModel):
    is_correct: bool