import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form'; // <-- Не забудьте этот импорт
import { motion, AnimatePresence } from 'framer-motion';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const API_URL = "http://127.0.0.1:8000";
const SOLVED_TASKS_STORAGE_KEY = 'mathAppSolvedTasks';

export default function TaskSolver({ topic, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [feedback, setFeedback] = useState({ show: false, message: '', variant: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [textAnswer, setTextAnswer] = useState(""); // Состояние для текстового инпута
  const [hintVisible, setHintVisible] = useState(false);

  const [solvedTasks, setSolvedTasks] = useState(() => {
    const savedTasks = localStorage.getItem(SOLVED_TASKS_STORAGE_KEY);
    return savedTasks ? new Set(JSON.parse(savedTasks)) : new Set();
  });

  useEffect(() => {
    const solvedTasksArray = Array.from(solvedTasks);
    localStorage.setItem(SOLVED_TASKS_STORAGE_KEY, JSON.stringify(solvedTasksArray));
  }, [solvedTasks]);

  useEffect(() => {
    if (!topic) return;

    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const fetchAndPrepareTasks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/tasks?topic_id=${topic.id}`);
        if (!response.ok) throw new Error(`Сетевая ошибка: ${response.status}`);
        const data = await response.json();
        
        const shuffledTasks = shuffleArray(data);
        setTasks(shuffledTasks);
        
        const savedSolvedTasks = new Set(JSON.parse(localStorage.getItem(SOLVED_TASKS_STORAGE_KEY) || '[]'));
        let firstUnsolvedIndex = -1;
        for (let i = 0; i < shuffledTasks.length; i++) {
            if (!savedSolvedTasks.has(shuffledTasks[i].id)) {
                firstUnsolvedIndex = i;
                break;
            }
        }
        
        if (firstUnsolvedIndex !== -1) {
            setCurrentTaskIndex(firstUnsolvedIndex);
        } else if (shuffledTasks.length > 0) {
            setCurrentTaskIndex(0);
        }
        
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Не удалось загрузить задачи. Пожалуйста, убедитесь, что сервер запущен.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPrepareTasks();
  }, [topic]);

  const handleAnswer = async (userAnswer) => {
    if (isAnswered || !userAnswer) return;
    const task = tasks[currentTaskIndex];
    const response = await fetch(`${API_URL}/check-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, user_answer: userAnswer })
    });
    const result = await response.json();
    if (result.is_correct) {
      setFeedback({ show: true, message: 'Верно!', variant: 'success' });
      setSolvedTasks(prev => new Set(prev).add(task.id));
    } else {
      setFeedback({ show: true, message: 'Неверно. Подумайте еще раз.', variant: 'danger' });
    }
    setIsAnswered(true);
  };

  const handleNextTask = () => {
    let nextIndex = currentTaskIndex + 1;
    for (let i = 0; i < tasks.length; i++) {
        const potentialIndex = (nextIndex + i) % tasks.length;
        if (!solvedTasks.has(tasks[potentialIndex].id)) {
            setCurrentTaskIndex(potentialIndex);
            setFeedback({ show: false, message: '', variant: 'success' });
            setIsAnswered(false);
            setTextAnswer(""); // Сбрасываем текстовое поле
            setHintVisible(false);
            return;
        }
    }
  };
  
  const renderAnswerInput = (task) => {
    if (!task) return null; // Защита, если задача еще не загружена

    switch (task.task_type) {
      case 'convergence':
        return (
          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
            <Button variant="outline-primary" size="lg" onClick={() => handleAnswer('сходится')} disabled={isAnswered}>Сходится</Button>
            <Button variant="outline-secondary" size="lg" onClick={() => handleAnswer('расходится')} disabled={isAnswered}>Расходится</Button>
          </div>
        );

      case 'numeric':
      case 'expression':
        return (
          <div className="d-flex justify-content-center align-items-center">
            <Form.Control 
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Введите ответ"
              className="w-75 me-2"
              disabled={isAnswered}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAnswer(textAnswer); }}
            />
            <Button onClick={() => handleAnswer(textAnswer)} disabled={isAnswered}>Проверить</Button>
          </div>
        );
        
      default:
        return <Alert variant="warning">Неизвестный тип задачи: {task.task_type}</Alert>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> <p className="mt-3">Загрузка задач...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-5">{error}</Alert>;
  }

  const cardVariants = {
    initial: { opacity: 0, x: -100, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.3 } }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={onBack}>&larr; К выбору тем</Button>
        <h2 className="mb-0 text-center">{topic.name}</h2>
        <div style={{width: '90px'}}></div>
      </div>

      {tasks.length > 0 ? (
        (() => {
          const currentTask = tasks[currentTaskIndex];
          if (!currentTask) return <Alert variant="warning">Загрузка задачи...</Alert>;

          const solvedInThisTopic = new Set([...solvedTasks].filter(id => tasks.some(t => t.id === id)));
          const progress = Math.round((solvedInThisTopic.size / tasks.length) * 100);
          const allTasksSolved = solvedInThisTopic.size === tasks.length;

          return (
            <>
              <ProgressBar 
                variant={allTasksSolved ? 'success' : 'primary'}
                now={progress} 
                label={`${solvedInThisTopic.size}/${tasks.length}`} 
                className="mb-4" 
              />
              <div style={{ position: 'relative', minHeight: '350px' }}>
                <AnimatePresence exitBeforeEnter>
                  <motion.div
                    key={currentTask.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ position: 'absolute', width: '100%' }}
                  >
                    {!allTasksSolved ? (
                      <Card>
                        <Card.Body>
                          <Card.Title className="text-center mb-4">Задача #{currentTask.id}</Card.Title>
                          <p className="text-center text-muted">{currentTask.instruction}</p>
                          <div 
                            className="my-4 fs-4 text-center"
                            dangerouslySetInnerHTML={{ __html: katex.renderToString(currentTask.problem_latex, { throwOnError: false, displayMode: true }) }}
                          />
                          {renderAnswerInput(currentTask)}
                        </Card.Body>
                      </Card>
                    ) : (
                      <Alert variant="success" className="text-center">
                        <Alert.Heading>Поздравляем!</Alert.Heading>
                        <p>Вы успешно решили все задачи в этой теме.</p>
                      </Alert>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {feedback.show && (
                <Alert variant={feedback.variant} className="mt-4" onClose={() => setFeedback({ ...feedback, show: false })} dismissible>
                  {feedback.message}
                </Alert>
              )}

              {!allTasksSolved && (
                <div className="text-center mt-3">

                  {hintVisible && (
                    <Alert variant="secondary" className="d-inline-block">
                      {currentTask.hint}
                    </Alert>
                  )}

                  {!hintVisible && (
                    <Button variant="outline-info" onClick={() => setHintVisible(true)}>
                      Показать подсказку
                    </Button>
                  )}
                </div>
              )}

              {!allTasksSolved && (
                <div className="text-center mt-4">
                  <Button variant="info" onClick={handleNextTask}>Следующая задача</Button>
                </div>
              )}
            </>
          );
        })()
      ) : (
        <Alert variant="info">В этой теме пока нет задач. Выберите другую.</Alert>
      )}
    </>
  );
}