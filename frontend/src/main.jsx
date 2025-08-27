import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import DisciplinePage from './pages/DisciplinePage.jsx';
import TaskSolver from './TaskSolver.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
      <Route index element={<HomePage />} />
          <Route path=":disciplineSlug" element={<DisciplinePage />} />
          <Route path=":disciplineSlug/:topicSlug" element={<TaskSolver />} />  
          <Route index element={<div>Главная страница (в разработке)</div>} />
      </Route>
    </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
