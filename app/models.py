from sqlalchemy import Column, Integer, String, Enum
from .database import Base
import enum

class Convergence(str, enum.Enum):
    """
    Перечисление для возможных ответов о сходимости ряда.
    Обеспечивает целостность данных в базе.
    """
    CONVERGES = "сходится"
    DIVERGES = "расходится"

class Task(Base):
    """
    Модель SQLAlchemy, представляющая таблицу 'tasks' в базе данных.
    Каждая запись в этой таблице - это одна математическая задача.
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    # Текст задачи в формате LaTeX. Он будет рендериться на фронтенде.
    problem_latex = Column(String, nullable=False)
    # Правильный ответ: 'сходится' или 'расходится'
    correct_answer = Column(Enum(Convergence), nullable=False)