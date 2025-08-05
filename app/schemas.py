from typing import List
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

class TopicPublic(BaseModel):
    id: int
    name: str
    class Config: from_attributes = True

class SectionPublic(BaseModel):
    name: str
    topics: List[TopicPublic] = []
    class Config: from_attributes = True

class DisciplinePublic(BaseModel):
    id: int
    name: str
    abbreviation: str | None = None
    description: str | None = None
    color: str | None = None
    sections: List[SectionPublic] = []
    class Config: from_attributes = True


class AnswerRequest(BaseModel):
    task_id: int
    user_answer: str

class AnswerResponse(BaseModel):
    is_correct: bool