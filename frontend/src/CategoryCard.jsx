import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css'; // Мы создадим этот CSS-файл следующим

// Компонент принимает пропсы: название, аббревиатуру, описание, цвет и функцию onClick
export default function CategoryCard({ title, abbreviation, description, color, to, onClick }) {
  // Создаем объект стилей, чтобы динамически задать цвет фона
  const cardStyle = {
    backgroundColor: color,
  };

  const cardContent = (
    <div className="discipline-card h-100" style={cardStyle}>
      <div className="card-content">
        <h3 className="card-abbreviation">{abbreviation || title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="col-12 col-md-6 col-lg-3 mb-4"> 
    {to ? (
      <Link to={to} className="discipline-card-link">
      {cardContent}
        </Link>
      ) : (
        // ИНАЧЕ - рендерим простой `div` с обработчиком `onClick`
        <div onClick={onClick} className="discipline-card-link" style={{ cursor: 'pointer' }}>
          {cardContent}
        </div>
      )}
    </div>
  );
}