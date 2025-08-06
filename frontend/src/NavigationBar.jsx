import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';

export default function NavigationBar({ onNavigateHome }) {
  return (
    // `bg="light"` - светлый фон
    // `expand="lg"` - на больших экранах (lg) навбар будет развернут, на меньших - схлопнется в "бургер"
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container fluid="xl">
        <Navbar.Brand 
          href="#" 
          onClick={(e) => {
            e.preventDefault(); // Предотвращаем стандартный переход по ссылке
            onNavigateHome();   // Вызываем нашу функцию для сброса состояния
          }}
        >
          Математический Тренажер
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigateHome();
              }}
            >
              Выбор Дисциплины
            </Nav.Link>
            {/* Здесь в будущем можно добавить другие ссылки, например, "Профиль" или "О проекте" */}
            {/* <Nav.Link href="#profile">Профиль</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}