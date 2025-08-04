from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL для подключения к нашей файловой базе данных SQLite.
# 'sqlite:///./tasks.db' означает, что файл tasks.db будет создан в корне проекта.
DATABASE_URL = "sqlite:///./tasks.db"

# 'Движок' SQLAlchemy для взаимодействия с БД.
# connect_args необходим для SQLite для работы с FastAPI.
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()