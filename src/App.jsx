// ./src/App.jsx

import { AuthProvider } from './contexts/AuthContext.jsx';
import AppContent from './AppContent.jsx';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;