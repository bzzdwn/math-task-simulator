from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload
from typing import List, Optional

from . import crud, models, schemas
from .database import SessionLocal, engine
import sympy

def check_convergence(task: models.Task, user_answer: str) -> bool:
    return task.answer_convergence and task.answer_convergence.value == user_answer

def check_numeric(task: models.Task, user_answer: str) -> bool:
    try:
        return task.answer_numeric is not None and abs(float(user_answer) - task.answer_numeric) < (task.numeric_precision or 0.001)
    except (ValueError, TypeError):
        return False

def check_expression(task: models.Task, user_answer: str) -> bool:
    try:
        return task.answer_expression_str and sympy.simplify(sympy.sympify(user_answer) - sympy.sympify(task.answer_expression_str)) == 0
    except (sympy.SympifyError, SyntaxError):
        return False

CHECKER_DISPATCHER = {
    models.TaskTypeEnum.CONVERGENCE: check_convergence,
    models.TaskTypeEnum.NUMERIC: check_numeric,
    models.TaskTypeEnum.EXPRESSION: check_expression,
}

# Эта строка не обязательна, если вы запускаете create_db.py отдельно,
# но полезна, если вы хотите, чтобы таблицы создавались при первом запуске приложения.
# models.Base.metadata.create_all(bind=engine) 

app = FastAPI(title="LeetMath API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Укажите домен фронтенда в продакшене
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функция-зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/tasks", response_model=List[schemas.TaskPublic], tags=["Tasks"])
def read_tasks(db: Session = Depends(get_db), topic_id: Optional[int] = None):
    """
    Получить список всех задач.
    """
    tasks = crud.get_tasks(db, topic_id=topic_id)
    return tasks

@app.get("/structure", tags=["Navigation"])
def get_content_structure(db: Session = Depends(get_db)):
    """Возвращает полную иерархическую структуру контента"""
    disciplines = db.query(models.Discipline).options(
        selectinload(models.Discipline.sections).selectinload(models.Section.topics)
    ).all()

    response_structure = {}
    for d in disciplines:
        response_structure[d.name] = {}
        for s in d.sections:
            response_structure[d.name][s.name] = [{"id": t.id, "name": t.name} for t in s.topics]
    
    return response_structure

@app.post("/check-answer", response_model=schemas.AnswerResponse)
def check_answer(answer_request: schemas.AnswerRequest, db: Session = Depends(get_db)):
    """
    Проверить ответ пользователя на задачу.
    """
    task = crud.get_task(db, task_id=answer_request.task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    checker_function = CHECKER_DISPATCHER.get(task.task_type)
    
    if not checker_function:
        raise HTTPException(status_code=500, detail=f"Проверка для типа задачи '{task.task_type.value}' не реализована.")

    is_correct = checker_function(task, answer_request.user_answer)
    
    return {"is_correct": is_correct}