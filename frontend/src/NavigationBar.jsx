import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import './NavigationBar.css';

export default function NavigationBar({ onNavigateHome }) {
  return (
    // `bg="light"` - светлый фон
    // `expand="lg"` - на больших экранах (lg) навбар будет развернут, на меньших - схлопнется в "бургер"
    <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container fluid="xl"> 
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Nav.Link 
                        href="#"
                        className="animated-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigateHome();
                        }}
                    >
                    Дисциплины
                    </Nav.Link>
            {/* Здесь в будущем можно добавить другие ссылки, например, "Профиль" или "О проекте" */}
            {/* <Nav.Link href="#profile">Профиль</Nav.Link> */}
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  );
}