import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import TaskSolver from './TaskSolver';
import './index.css';
import DisciplineCard from './CategoryCard';
import './DisciplineCard.css';
import NavigationBar from './NavigationBar';

const API_URL = "http://127.0.0.1:8000";
const NAVIGATION_STATE_KEY = 'mathAppNavigationState';

function App() {
  const [structure, setStructure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDiscipline, setCurrentDiscipline] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(() => {
    const savedState = JSON.parse(localStorage.getItem(NAVIGATION_STATE_KEY) || '{}');
    return savedState.topic || null;
  });

  const navigateToHome = () => {
    setCurrentDiscipline(null);
    setCurrentSection(null);
    setCurrentTopic(null);
  };

  useEffect(() => {
    const fetchStructure = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/structure`);
        const data = await response.json();
        setStructure(data);
      } catch (error) {
        console.error("Failed to fetch structure:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStructure();
  }, []);
  
  useEffect(() => {
    const navigationState = {
      discipline: currentDiscipline,
      section: currentSection,
      topic: currentTopic,
    };
    localStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(navigationState));
  }, [currentDiscipline, currentSection, currentTopic]);

  const selectDiscipline = (disciplineObject) => {
    setCurrentDiscipline(disciplineObject);
    setCurrentSection(null);
    setCurrentTopic(null);
  };

  const selectSection = (sectionObject) => {
    setCurrentSection(sectionObject);
    setCurrentTopic(null);
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <> 
    <NavigationBar onNavigateHome={navigateToHome} />
    <Container fluid="lg" className="my-5">

      {!currentTopic ? (
        <div>
          {/* --- Блок выбора дисциплины (уже правильный) --- */}
          {!currentDiscipline && structure && (
            <>
              <h2 className="mb-5 text-center">Выберите дисциплину:</h2>
                <div className="row">
                  {structure.map(discipline => (
                    <DisciplineCard
                      key={discipline.id}
                      title={discipline.name}
                      abbreviation={discipline.abbreviation}
                      description={discipline.description}
                      color={discipline.color}
                      onClick={() => selectDiscipline(discipline)}
                    />
                  ))}
                </div>
            </>
          )}

          {/* --- ИСПРАВЛЕННЫЙ блок выбора раздела --- */}
          {currentDiscipline && !currentSection && (
            <>
              {/* Используем .name для отображения */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={() => selectDiscipline(null)}>&larr; К дисциплинам</Button>
                <h2 className="mb-3 text-center">{currentDiscipline.name}</h2>
                {/* Пустая распорка для идеального центрирования заголовка */}
                <div style={{width: '150px'}}></div> 
              </div>

              <div className="row">
                {currentDiscipline.sections.map(section => ( 
                <DisciplineCard
                  key={section.name} // Временный ключ, лучше бы ID
                  title={section.name}
                  description={section.description}
                  color={section.color}
                  onClick={() => selectSection(section)}
                />
              ))}
              </div>
              
            </>
          )}

          {/* --- ИСПРАВЛЕННЫЙ блок выбора темы --- */}
          {currentDiscipline && currentSection && (
            <>
              {/* Используем .name для отображения */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Button variant="outline-secondary" onClick={() => selectSection(null)}>&larr; К разделам</Button>
                <h2 className="mb-3 text-center">{currentSection.name}</h2>
                <div style={{width: '130px'}}></div>
              </div>
              <div className="row">
                {currentSection.topics.map(topic => (
                  <DisciplineCard
                    key={topic.id}
                    title={topic.name}
                    description={topic.description}
                    color={topic.color}
                    onClick={() => setCurrentTopic(topic)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <TaskSolver topic={currentTopic} onBack={() => setCurrentTopic(null)} />
      )}
    </Container>
    </>
  );
}
