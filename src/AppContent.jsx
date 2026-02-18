// ./src/AppContent.jsx

import { useAuth } from './contexts/AuthContext.jsx';
import LoginForm from './components/LoginForm/LoginForm.jsx';
import Navigation from './components/Navigation/Navigation.jsx';
import HomePage from './pages/HomePage/HomePage.jsx';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {user ? (
        <>
          <Navigation />
          <HomePage />
        </>
      ) : (
        <LoginForm />
      )}
    </>
  );
}

export default AppContent;