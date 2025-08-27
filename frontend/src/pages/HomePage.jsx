import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import CategoryCard from '../CategoryCard';

const API_URL = "http://127.0.0.1:8000";

function HomePage() {
  const [structure, setStructure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStructure = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/structure`);
        if (!response.ok) throw new Error("Не удалось загрузить данные");
        const data = await response.json();
        setStructure(data);
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch structure:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStructure();
  }, []);

  if (isLoading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <h2 className="mb-5 text-center">Выберите дисциплину:</h2>
      <div className="row">
        {structure && structure.map(discipline => (
            <CategoryCard
                key={discipline.id}
                to={`/${discipline.slug}`}
                title={discipline.name}
                abbreviation={discipline.abbreviation}
                description={discipline.description}
                color={discipline.color}
            />
        ))}
      </div>
    </>
  );
}

export default HomePage;