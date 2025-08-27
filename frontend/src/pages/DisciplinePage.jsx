// frontend/src/pages/DisciplinePage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Хуки для работы с URL
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import CategoryCard from '../CategoryCard'; // Переименуем DisciplineCard для универсальности

const API_URL = "http://127.0.0.1:8000";

export default function DisciplinePage() {
  // useParams() позволяет "вытащить" динамические параметры из URL
  // Например, для URL "/math-analysis", `disciplineSlug` будет "math-analysis"
  const { disciplineSlug } = useParams();
  const navigate = useNavigate(); // Хук для программной навигации

  const [disciplineData, setDisciplineData] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDisciplineData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Загружаем всю структуру, чтобы найти нужную дисциплину
        // (в будущем можно создать API-эндпоинт для получения одной дисциплины)
        const response = await fetch(`${API_URL}/structure`);
        if (!response.ok) throw new Error("Не удалось загрузить данные");
        const structure = await response.json();
        
        // Ищем в загруженных данных дисциплину с нужным slug
        const foundDiscipline = structure.find(d => d.slug === disciplineSlug);

        if (foundDiscipline) {
          setDisciplineData(foundDiscipline);
        } else {
          throw new Error(`Дисциплина "${disciplineSlug}" не найдена`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisciplineData();
  }, [disciplineSlug]); // Перезагружаем данные, если slug в URL изменился

  // Обработчики для навигации внутри страницы
  const selectSection = (section) => setCurrentSection(section);
//   const selectTopic = (topic) => {
//     // Переходим на страницу решения задач
//     navigate(`/${disciplineSlug}/${topic.slug}`);
//   };

  if (isLoading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  if (!disciplineData) return null; // Если данных нет, ничего не рендерим

  return (
    <>
      {/* Если раздел не выбран, показываем разделы */}
      {!currentSection ? (
            <>
            {/* НОВЫЙ ЗАГОЛОВОК С КНОПКОЙ "НАЗАД" */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* useNavigate('/') вернет пользователя на главную страницу */}
                <Button variant="outline-secondary" onClick={() => navigate('/')}>&larr; К дисциплинам</Button>
                <h2 className="mb-0 text-center">{disciplineData.name}</h2>
                <div style={{width: '150px'}}></div> {/* Распорка */}
            </div>

            <h4 className="mb-4">Выберите раздел:</h4>
            <div className="row">
                {disciplineData.sections.map(section => (
                <CategoryCard
                    key={section.name}
                    title={section.name}
                    description={section.description}
                    color={section.color}
                    onClick={() => selectSection(section)}
                />
                ))}
            </div>
            </>
        ) : (
        // Если раздел выбран, показываем темы этого раздела
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="outline-secondary" onClick={() => setCurrentSection(null)}>&larr; К разделам</Button>
            <h2 className="mb-0 text-center">{currentSection.name}</h2>
            <div style={{width: '130px'}}></div>
          </div>
          <h4 className="mb-4">Выберите тему:</h4>
          <div className="row">
            {currentSection.topics.map(topic => (
              <CategoryCard
                key={topic.id}
                to={`/${disciplineSlug}/${topic.slug}`} 
                title={topic.name}
                description={topic.description}
                color={topic.color}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}