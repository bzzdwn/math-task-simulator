from sqlalchemy.orm import Session
from . import models

def get_tasks(db: Session, topic_id: int = None):
    query = db.query(models.Task)

    if topic_id:
        query = query.filter(models.Task.topic_id == topic_id)
        
    return query.all()

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()