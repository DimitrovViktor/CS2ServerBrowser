import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServerListPage from './pages/ServerListPage';
import AddServerPage from './pages/AddServerPage';
import Authentication from './components/Authentication';
import { AuthProvider } from './context/AuthContext';
import './style.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<ServerListPage />} />
            <Route path="/add-server" element={<AddServerPage />} />
            <Route path="/myservers" element={<AddServerPage />} />
            <Route path="/auth" element={<Authentication />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
