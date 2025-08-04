from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine

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

@app.get("/tasks", response_model=List[schemas.TaskPublic])
def read_tasks(db: Session = Depends(get_db)):
    """
    Получить список всех задач.
    """
    tasks = crud.get_tasks(db)
    return tasks

@app.post("/check-answer", response_model=schemas.AnswerResponse)
def check_answer(answer_request: schemas.AnswerRequest, db: Session = Depends(get_db)):
    """
    Проверить ответ пользователя на задачу.
    """
    task = crud.get_task(db, task_id=answer_request.task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    is_correct = (task.correct_answer == answer_request.user_answer)
    return {"is_correct": is_correct}