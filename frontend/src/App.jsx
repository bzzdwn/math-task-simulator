import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import 'katex/dist/katex.min.css';
import katex from 'katex';
import './index.css'; // Убедитесь, что этот файл содержит стили для центрирования

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [solvedTasks, setSolvedTasks] = useState(new Set());
  const [feedback, setFeedback] = useState({ show: false, message: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // *** НОВОЕ СОСТОЯНИЕ: Ответил ли пользователь на текущую задачу ***
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error(`Сетевая ошибка: ${response.status}`);
        const data = await response.json();
        setTasks(data);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Не удалось подключиться к серверу. Пожалуйста, убедитесь, что он запущен, и обновите страницу.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // *** НОВАЯ ФУНКЦИЯ: Обработчик ответа пользователя ***
  const handleAnswer = async (userAnswer) => {
    if (isAnswered) return; // Защита от повторных нажатий

    const task = tasks[currentTaskIndex];
    try {
      const response = await fetch(`${API_URL}/check-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, user_answer: userAnswer })
      });
      if (!response.ok) throw new Error('Ошибка при проверке ответа');
      
      const result = await response.json();

      if (result.is_correct) {
        setFeedback({ show: true, message: 'Верно!', variant: 'success' });
        // Добавляем ID решенной задачи в Set для подсчета прогресса
        setSolvedTasks(prev => new Set(prev).add(task.id));
      } else {
        setFeedback({ show: true, message: 'Неверно. Подумайте еще раз.', variant: 'danger' });
      }
      setIsAnswered(true); // Помечаем, что на задачу ответили
    } catch (err) {
      console.error("Answer check error:", err);
      setFeedback({ show: true, message: 'Не удалось проверить ответ.', variant: 'warning' });
    }
  };

  // *** НОВАЯ ФУНКЦИЯ: Обработчик перехода к следующей задаче ***
const handleNextTask = () => {
    // Начинаем поиск со следующего индекса
    let nextIndex = currentTaskIndex + 1;

    // Ищем следующий нерешенный индекс
    // Мы пройдем по кругу не более одного раза
    for (let i = 0; i < tasks.length; i++) {
        // Зацикливаем индекс, чтобы после последней задачи начать с первой
        const potentialIndex = (nextIndex + i) % tasks.length;
        
        // Если ID задачи с этим индексом НЕТ в списке решенных
        if (!solvedTasks.has(tasks[potentialIndex].id)) {
            // Мы нашли следующую нерешенную задачу!
            setCurrentTaskIndex(potentialIndex);
            setFeedback({ show: false, message: '', variant: 'success' });
            setIsAnswered(false);
            return; // Выходим из функции, так как дело сделано
        }
    }
  };
  
  // --- Код для рендеринга остается почти без изменений, но с добавлением обработчиков ---

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" /> <span className="ms-3">Загрузка задач...</span>
      </Container>
    );
  }

  if (error) {
    return <Container className="mx-auto" style={{maxWidth: '800px'}}><Alert variant="danger" className="mt-5">{error}</Alert></Container>;
  }

  if (tasks.length === 0) {
    return <Container className="mx-auto" style={{maxWidth: '800px'}}><Alert variant="warning" className="mt-5">Задачи не найдены.</Alert></Container>;
  }

  const currentTask = tasks[currentTaskIndex];
  const progress = Math.round((solvedTasks.size / tasks.length) * 100);

  const allTasksSolved = tasks.length > 0 && solvedTasks.size === tasks.length;

  return (
      <Container className="my-5 mx-auto" style={{ maxWidth: '800px' }}>
          <h1 className="mb-4 text-center">Исследуйте ряд на сходимость</h1>
          <ProgressBar 
              variant={allTasksSolved ? 'success' : 'primary'}
              now={progress} 
              label={`${solvedTasks.size}/${tasks.length}`} 
              className="mb-4" 
          />
        
          {/* *** НОВОЕ УСЛОВИЕ: Показываем карточку, только если не все решено *** */}
          {!allTasksSolved ? (
              <Card>
                  <Card.Body>
                      <Card.Title className="text-center mb-4">Задача #{currentTask.id}</Card.Title>
                      <div 
                          className="my-4 fs-4 text-center"
                          dangerouslySetInnerHTML={{ __html: katex.renderToString(currentTask.problem_latex, { throwOnError: false, displayMode: true }) }}
                      />
                      <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                          <Button 
                              variant="outline-primary" 
                              size="lg" 
                              onClick={() => handleAnswer('сходится')} 
                              disabled={isAnswered}
                          >
                              Сходится
                          </Button>
                          <Button 
                              variant="outline-secondary" 
                              size="lg" 
                              onClick={() => handleAnswer('расходится')} 
                              disabled={isAnswered}
                          >
                              Расходится
                          </Button>
                      </div>
                  </Card.Body>
              </Card>
          ) : (
              // *** НОВЫЙ БЛОК: Показываем поздравление, если все решено ***
              <Alert variant="success" className="text-center">
                  <Alert.Heading>Поздравляем!</Alert.Heading>
                  <p>Вы успешно решили все задачи.</p>
              </Alert>
          )}

          {feedback.show && (
              <Alert variant={feedback.variant} className="mt-4" onClose={() => setFeedback({ ...feedback, show: false })} dismissible>
                  {feedback.message}
              </Alert>
          )}

          {/* *** НОВОЕ УСЛОВИЕ: Показываем кнопку "Следующая", только если не все решено *** */}
          {!allTasksSolved && (
              <div className="text-center mt-4">
                  <Button variant="info" onClick={handleNextTask}>
                      Следующая задача
                  </Button>
              </div>
          )}
      </Container>
  );
}

export default App;