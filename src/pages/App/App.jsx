// ./src/pages/App/App.jsx

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styles from './App.module.scss';
import { getUser } from '../../utilities/users-service';
import AuthPage from '../AuthPage/AuthPage';
import NewOrderPage from '../NewOrderPage/NewOrderPage';
import OrderHistoryPage from '../OrderHistoryPage/OrderHistoryPage';
import Navigation from '../../components/Navigation/Navigation';
import HomePage from '../HomePage/HomePage';
import AboutPage from '../AboutPage/AboutPage';
import ContactPage from '../ContactPage/ContactPage';
import Footer from '../../components/Footer/Footer';

export default function App() {
  const [user, setUser] = useState(getUser());
  const location = useLocation();

  return (
    <main className={styles.App}>
      <Navigation user={user} />
      <div key={location.pathname} className={styles.routeContent}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} initialMode="login" />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} initialMode="signup" />} />
          <Route
            path="/orders/new"
            element={user ? <NewOrderPage user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={user ? <OrderHistoryPage user={user} setUser={setUser} /> : <Navigate to="/login" replace />}
          />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </main>
  );
}
