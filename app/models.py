from sqlalchemy import Column, Integer, String, Enum as SQLAlchemyEnum, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.dialects.postgresql import JSONB # Для PostgreSQL
from sqlalchemy.types import JSON # Для SQLite
import enum

class TaskTypeEnum(str, enum.Enum):
    CONVERGENCE = "convergence"  # Сходимость (сходится/расходится)
    NUMERIC = "numeric"          # Числовой ответ
    EXPRESSION = "expression"    # Формула/выражение

class Convergence(str, enum.Enum):
    CONVERGES = "сходится"
    DIVERGES = "расходится"

class Discipline(Base):
    __tablename__ = "disciplines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    abbreviation = Column(String)
    description = Column(String)
    color = Column(String)
    slug = Column(String, unique=True)
    sections = relationship("Section", back_populates="discipline")

class Section(Base):
    __tablename__ = "sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    color = Column(String)
    slug = Column(String, unique=True)
    discipline_id = Column(Integer, ForeignKey('disciplines.id'))
    discipline = relationship("Discipline", back_populates="sections")
    topics = relationship("Topic", back_populates="section")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    color = Column(String)
    slug = Column(String, unique=True)
    section_id = Column(Integer, ForeignKey('sections.id'))
    section = relationship("Section", back_populates="topics")
    tasks = relationship("Task", back_populates="topic")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey('topics.id'))
    topic = relationship("Topic", back_populates="tasks")
    
    instruction = Column(String, nullable=False)
    problem_latex = Column(String, nullable=False)
    hint = Column(String)
    slug = Column(String, unique=True)
    
    task_type = Column(SQLAlchemyEnum(TaskTypeEnum), nullable=False)

    answer_convergence = Column(SQLAlchemyEnum(Convergence), nullable=True) # Для 'сходится/расходится'
    answer_numeric = Column(Float, nullable=True) # Для числовых ответов
    answer_expression_str = Column(String, nullable=True) # Для формул в виде строки
