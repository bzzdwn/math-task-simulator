import sys
import os
import yaml

# Добавляем корневую папку проекта в путь, чтобы можно было импортировать 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.database import engine, SessionLocal
from app.models import Base, Discipline, Section, Topic, Task, Convergence, TaskTypeEnum

DATA_FILE = os.path.join(os.path.dirname(__file__), '..', 'content', 'tasks_data.yaml')

def populate_database():
    """
    Создает таблицы и наполняет их данными из YAML-файла.
    """
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы.")
    
    db = SessionLocal()
    
    try:
        if db.query(Discipline).count() > 0:
            print("База данных уже содержит данные. Наполнение не требуется.")
            return
        
        print("Начинаю наполнение базы данных из YAML файла...")
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            structure_data = yaml.safe_load(f)
            for discipline_data in structure_data:
                new_discipline = Discipline(name=discipline_data['discipline_name'])

                for section_data in discipline_data["sections"]:
                    new_section = Section(name=section_data["section_name"], discipline=new_discipline)
                    db.add(new_section)

                    for topic_data in section_data["topics"]:
                        new_topic = Topic(name=topic_data["topic_name"], section=new_section)
                        db.add(new_topic)

                        for task_data in topic_data.get("tasks", []):
                            # Создаем словарь с общими данными для задачи
                            task_args = {
                                "instruction": task_data.get("instruction"),
                                "problem_latex": task_data["problem_latex"],
                                "hint": task_data.get("hint"),
                                "topic": new_topic
                            }

                            task_type_str = task_data["task_type"]
                            task_args["task_type"] = TaskTypeEnum(task_type_str)
                            
                            if task_type_str == "convergence":
                                task_args["answer_convergence"] = Convergence(task_data["answer"])
                            elif task_type_str == "numeric":
                                task_args["answer_numeric"] = float(task_data["answer"])
                            elif task_type_str == "expression":
                                task_args["answer_expression_str"] = task_data["answer"]

                            new_task = Task(**task_args)
                            db.add(new_task)

            db.commit()
            print("База данных успешно наполнена.")
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()