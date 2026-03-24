// ./src/pages/App/App.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styles from './App.module.scss';
import { getUser } from '../../utilities/users-service';
import AuthPage from '../AuthPage/AuthPage';
import NewOrderPage from '../NewOrderPage/NewOrderPage';
import OrderHistoryPage from '../OrderHistoryPage/OrderHistoryPage';
import CheckoutAccessPage from '../CheckoutAccessPage/CheckoutAccessPage';
import CheckoutPage from '../CheckoutPage/CheckoutPage';
import ApsPaymentReturnPage from '../ApsPaymentReturnPage/ApsPaymentReturnPage';
import Navigation from '../../components/Navigation/Navigation';
import HomePage from '../HomePage/HomePage';
import AboutPage from '../AboutPage/AboutPage';
import ContactPage from '../ContactPage/ContactPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import OrderDetailsPage from '../OrderDetailsPage/OrderDetailsPage';
import AdminDashboardPage from '../AdminDashboardPage/AdminDashboardPage';
import AdminUsersPage from '../AdminUsersPage/AdminUsersPage';
import AdminProductsPage from '../AdminProductsPage/AdminProductsPage';
import AdminOrdersPage from '../AdminOrdersPage/AdminOrdersPage';
import Footer from '../../components/Footer/Footer';
import { logOut } from '../../utilities/users-service';

export default function App() {
  const [user, setUser] = useState(getUser());
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  function handleAddToCart(product) {
    if (!product?._id) return;
    const qtyToAdd = Number.isFinite(Number(product.qty)) && Number(product.qty) > 0
      ? Math.floor(Number(product.qty))
      : 1;

    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + qtyToAdd } : item
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name,
          image: product.image || '',
          price: Number(product.price) || 0,
          qty: qtyToAdd
        }
      ];
    });
  }

  function handleUpdateCartQty(productId, newQty) {
    setCartItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((item) => item._id !== productId);
      }
      return prev.map((item) =>
        item._id === productId ? { ...item, qty: newQty } : item
      );
    });
  }

  function handleRemoveFromCart(productId) {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  }

  function handleCheckoutComplete() {
    setCartItems([]);
  }

  function handleLogout() {
    logOut();
    setUser(null);
  }

  return (
    <main className={styles.App}>
      <Navigation user={user} cartCount={cartItems.reduce((sum, item) => sum + item.qty, 0)} />
      <div key={location.pathname} className={styles.routeContent}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} initialMode="login" />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} initialMode="signup" />} />
          <Route path="/orders/new" element={<NewOrderPage onAddToCart={handleAddToCart} />} />
          <Route path="/checkout/access" element={<CheckoutAccessPage setUser={setUser} user={user} />} />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                user={user}
                onCheckoutComplete={handleCheckoutComplete}
              />
            }
          />
          <Route
            path="/checkout/aps-return"
            element={<ApsPaymentReturnPage onCheckoutComplete={handleCheckoutComplete} />}
          />
          <Route
            path="/orders"
            element={
              <OrderHistoryPage
                cartItems={cartItems}
                onUpdateQty={handleUpdateCartQty}
                onRemoveItem={handleRemoveFromCart}
              />
            }
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} onLogout={handleLogout} /> : <AuthPage setUser={setUser} initialMode="login" />}
          />
          <Route
            path="/profile/orders/:orderId"
            element={user ? <OrderDetailsPage /> : <AuthPage setUser={setUser} initialMode="login" />}
          />
          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/users"
            element={user?.role === 'admin' ? <AdminUsersPage /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/products"
            element={user?.role === 'admin' ? <AdminProductsPage /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/orders"
            element={user?.role === 'admin' ? <AdminOrdersPage /> : <Navigate to="/" />}
          />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </main>
  );
}
