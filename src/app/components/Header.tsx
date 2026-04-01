import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Coins, LogOut, User, Menu } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600"></div>
            <span className="text-xl font-semibold">AcheiCostura</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Serviços
            </Link>
            <Link to="/my-applications" className="text-gray-700 hover:text-green-600 transition-colors">
              Minhas Candidaturas
            </Link>
            <Link to="/empresa/dashboard" className="text-green-600 font-medium hover:text-green-800 transition-colors">
              Minhas Vagas
            </Link>
            <Link to="/empresa/buscar" className="text-green-600 font-medium hover:text-green-800 transition-colors">
              Encontre Costureiros
            </Link>
            <Link to="/planos" className="text-gray-700 hover:text-green-600 transition-colors">
              Planos
            </Link>
            <Link to="/sobre-nos" className="text-gray-700 hover:text-green-600 transition-colors">
              Sobre Nós
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-green-600 transition-colors">
              Contato
            </Link>
          </nav>


          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Coins Display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">{user.coins}</span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">{user.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="sm:hidden">
                      <Coins className="mr-2 h-4 w-4" />
                      {user.coins} moedas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Cadastrar
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t flex flex-col gap-3">
            <Link 
              to="/empresa/dashboard" 
              className="text-green-600 font-medium hover:text-green-800 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sou Empresa (Painel)
            </Link>
            <Link 
              to="/empresa/buscar" 
              className="text-green-600 font-medium hover:text-green-800 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sou Empresa (encontre costureiros)
            </Link>
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link 
              to="/my-applications" 
              className="text-gray-700 hover:text-green-600 transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Minhas Candidaturas
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
