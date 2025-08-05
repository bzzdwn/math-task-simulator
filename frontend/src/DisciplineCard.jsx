import React from 'react';
import './DisciplineCard.css'; // Мы создадим этот CSS-файл следующим

// Компонент принимает пропсы: название, аббревиатуру, описание, цвет и функцию onClick
export default function DisciplineCard({ title, abbreviation, description, color, onClick }) {
  // Создаем объект стилей, чтобы динамически задать цвет фона
  const cardStyle = {
    backgroundColor: color,
  };

  return (
    // Используем Bootstrap классы для колонок. `col-md-6` означает "занимать 6 из 12 колонок на средних экранах и больше"
    // `col-lg-4` - 4 из 12 на больших. Это создает адаптивную сетку.
    <div className="col-12 col-md-6 col-lg-4 mb-4"> 
      <div className="discipline-card h-100" style={cardStyle} onClick={onClick}>
        <div className="card-content">
          <h3 className="card-abbreviation">{abbreviation || title}</h3>
          <p className="card-description">{description}</p>
        </div>
      </div>
    </div>
  );
}