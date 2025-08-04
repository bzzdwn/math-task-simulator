import sys
import os

# Добавляем корневую папку проекта в путь, чтобы можно было импортировать 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.database import engine, SessionLocal
from app.models import Base, Task, Convergence

tasks_data = [
    {"problem_latex": r"\sum_{n=1}^{\infty} \frac{2^{n+1} \cdot n}{\left(3 + \frac{1}{n}\right)^{2n}}", "correct_answer": Convergence.CONVERGES},
    {"problem_latex": r"\sum_{n=1}^{\infty} \frac{\left(2 + \frac{1}{2n}\right)^{2n}}{n \cdot 2^n}", "correct_answer": Convergence.DIVERGES},
    {"problem_latex": r"\sum_{n=1}^{\infty} \frac{4^{n+3} n^n}{(3n+1)^n (n+2)}", "correct_answer": Convergence.DIVERGES},
    {"problem_latex": r"\sum_{n=1}^{\infty} \left(\frac{n-1}{n+1}\right)^{n^2+4n+5}", "correct_answer": Convergence.CONVERGES},
    {"problem_latex": r"\sum_{n=1}^{\infty} n^3 \left(\operatorname{arctg} \frac{\pi(2n+1)}{2(\pi n + 3)}\right)^n", "correct_answer": Convergence.CONVERGES},
    {"problem_latex": r"\sum_{n=1}^{\infty} n \left(\frac{n+1}{2n+5}\right)^{n(n+5)}", "correct_answer": Convergence.CONVERGES},
]

def populate_database():
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы.")
    
    db = SessionLocal()
    try:
        if db.query(Task).count() == 0:
            print("База данных пуста. Добавляю задачи...")
            for data in tasks_data:
                db_task = Task(**data)
                db.add(db_task)
            db.commit()
            print(f"{len(tasks_data)} задач успешно добавлены.")
        else:
            print("База данных уже содержит задачи.")
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()