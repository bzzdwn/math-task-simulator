import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import TaskSolver from './TaskSolver';
import './index.css';

const API_URL = "http://127.0.0.1:8000";
const NAVIGATION_STATE_KEY = 'mathAppNavigationState';

function App() {
  const [structure, setStructure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentDiscipline, setCurrentDiscipline] = useState(() => {
    const savedState = JSON.parse(localStorage.getItem(NAVIGATION_STATE_KEY) || '{}');
    return savedState.discipline || null;
  });
  const [currentSection, setCurrentSection] = useState(() => {
    const savedState = JSON.parse(localStorage.getItem(NAVIGATION_STATE_KEY) || '{}');
    return savedState.section || null;
  });
  const [currentTopic, setCurrentTopic] = useState(() => {
    const savedState = JSON.parse(localStorage.getItem(NAVIGATION_STATE_KEY) || '{}');
    return savedState.topic || null;
  });

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

  const selectDiscipline = (name) => {
    setCurrentDiscipline(name);
    setCurrentSection(null);
    setCurrentTopic(null);
  };

  const selectSection = (name) => {
    setCurrentSection(name);
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
    <Container className="my-5 mx-auto" style={{ maxWidth: '800px' }}>
      <h1 className="mb-4 text-center">Тренажер по высшей математике</h1>

      {!currentTopic ? (
        <div>
          {!currentDiscipline && structure && (
            <>
              <h2 className="mb-3">Выберите дисциплину:</h2>
              {Object.keys(structure).map(disciplineName => (
                <Card key={disciplineName} className="mb-2" onClick={() => selectDiscipline(disciplineName)} style={{ cursor: 'pointer' }}>
                  <Card.Body>{disciplineName}</Card.Body>
                </Card>
              ))}
            </>
          )}

          {currentDiscipline && !currentSection && (
            <>
              <h2 className="mb-3">{currentDiscipline}</h2>
              <h4>Выберите раздел:</h4>
              {Object.keys(structure[currentDiscipline]).map(sectionName => (
                <Card key={sectionName} className="mb-2" onClick={() => selectSection(sectionName)} style={{ cursor: 'pointer' }}>
                  <Card.Body>{sectionName}</Card.Body>
                </Card>
              ))}
              <Button variant="link" onClick={() => selectDiscipline(null)} className="p-0 mt-2">Назад к дисциплинам</Button>
            </>
          )}

          {currentDiscipline && currentSection && (
            <>
              <h2 className="mb-3">{currentSection}</h2>
              <h4>Выберите тему:</h4>
              {structure[currentDiscipline][currentSection].map(topic => (
                <Card key={topic.id} className="mb-2" onClick={() => setCurrentTopic(topic)} style={{ cursor: 'pointer' }}>
                  <Card.Body>{topic.name}</Card.Body>
                </Card>
              ))}
              <Button variant="link" onClick={() => selectSection(null)} className="p-0 mt-2">Назад к разделам</Button>
            </>
          )}
        </div>
      ) : (
        <TaskSolver topic={currentTopic} onBack={() => setCurrentTopic(null)} />
      )}
    </Container>
  );
}

export default App;