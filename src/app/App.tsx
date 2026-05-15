import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { AuthProvider } from './context/AuthContext';
import Inicio from './pages/Inicio';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ServiceDetail } from './pages/ServiceDetail';
import { Login } from './pages/Login';
import { CadastroPage } from './pages/CadastroPage';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyJobCandidates } from './pages/CompanyJobCandidates';
import { MinhasCandidaturas } from './pages/MinhasCandidaturas';
import { BuscaCostureiros } from './pages/BuscaCostureiros';
import { CostureiroProfile } from './pages/CostureiroProfile';
import { Profile } from './pages/Profile';

import ContatoPage from './pages/contato';
import SobreNosPage from './pages/sobre';
import PlanosPage from './pages/planos';


import HomeServicos from './components/HomeServicos';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {/* O Header fica dentro do BrowserRouter para que o useNavigate funcione */}
          <Header /> 
          
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/" element={<Home />} />
            <Route path="/oportunidades" element={<HomeServicos />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<CadastroPage />} />

            <Route path="/my-applications" element={<MinhasCandidaturas />} />

            <Route path="/empresa/dashboard" element={<CompanyDashboard />} />
            <Route path="/empresa/vaga/:id/candidatos" element={<CompanyJobCandidates />} />
            <Route path="/empresa/buscar" element={<BuscaCostureiros />} />
            <Route path="/costureiro/:id" element={<CostureiroProfile />} />
            
            <Route path="/contato" element={<ContatoPage />} />
            <Route path="/sobre-nos" element={<SobreNosPage />} />
            <Route path="/planos" element={<PlanosPage />} />

            
            <Route path="/perfil" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />

            {/* Fallback para rotas não encontradas */}
            <Route path="*" element={<Home />} />
          </Routes>
          
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}