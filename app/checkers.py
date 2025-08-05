import sympy
from app.models import Task

def check_diff_equation_solution(task: Task, user_answer: str) -> bool:
    """
    Проверяет общее решение СтЛОУ. Сравнивает наборы фундаментальных решений
    """
    try:
        t = sympy.symbols('t')
        C1, C2 = sympy.symbols('C1 C2', cls=sympy.Dummy)

        user_expr = sympy.simplify(user_answer)
        correct_expr = sympy.simplify(task.answer_expression_str)

        user_collected = sympy.collect(user_expr.expand(), (C1, C2), evaluate=False)
        correct_collected = sympy.collect(correct_expr.expand(), (C1, C2), evaluate=False)

        user_solutions = set(user_collected.values())
        correct_solutions = set(correct_collected.values())

        if len(user_solutions) != len(correct_solutions):
            return False
        
        temp_correct_solutions = correct_solutions.copy()

        for u_sol in user_solutions:
            found_match = False
            for c_sol in temp_correct_solutions:
                if sympy.simplify(u_sol - c_sol) == 0:
                    found_match = True
                    temp_correct_solutions.remove(c_sol)
                    break
            if not found_match:
                return False
        return True
    
    except (sympy.SympifyError, SyntaxError, Exception):
        return False