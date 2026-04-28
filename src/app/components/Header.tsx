import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Coins, LogOut, User, Menu, X } from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gray-100 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Logo Achei Costura" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br 500 600 object-contain" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight">AcheiCostura</span>
          </Link>

          {/* Desktop Navigation - Alterado de md para lg para evitar quebra em tablets */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link to="/" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Serviços
            </Link>
            <Link to="/my-applications" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Minhas Candidaturas
            </Link>
            <Link to="/empresa/dashboard" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Minhas Vagas
            </Link>
            <Link to="/empresa/buscar" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Encontre Costureiros
            </Link>
            <Link to="/planos" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Planos
            </Link>
            <Link to="/sobre-nos" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Sobre Nós
            </Link>
            <Link to="/contato" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors">
              Contato
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {user ? (
              <>
                {/* Coins Display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-900">{user.coins}</span>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarImage src={user.avatar} alt={user.name || 'Usuário'} />
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium text-gray-800">{user.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-2 border-gray-100 shadow-lg">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="sm:hidden cursor-default">
                      <Coins className="mr-2 h-4 w-4" />
                      {user.coins} moedas
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-transparent hover:bg-gray-100 text-[#006D5B] px-2 sm:px-4 text-sm sm:text-base border-2 border-transparent" 
                  variant="ghost" 
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </Button>
                <Button 
                  onClick={() => navigate('/register')} 
                  className="bg-[#006D5B] hover:bg-[#005749] text-white px-3 sm:px-4 text-sm sm:text-base border-2 border-[#006D5B]"
                >
                  Cadastrar
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -mr-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 👇 Mobile Menu Dropdown Animado 👇 */}
        <nav 
          className={`lg:hidden flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen 
              ? "max-h-[600px] opacity-100 mt-4 pt-2 border-t border-gray-100 pb-4 pointer-events-auto" 
              : "max-h-0 opacity-0 mt-0 pt-0 pb-0 border-t-0 border-transparent pointer-events-none"
          }`}
        >
          <div className="flex flex-col gap-1">
            {[
              { to: "/", label: "Serviços" },
              { to: "/my-applications", label: "Minhas Candidaturas" },
              { to: "/empresa/dashboard", label: "Minhas Vagas" },
              { to: "/empresa/buscar", label: "Encontre Costureiros" },
              { to: "/planos", label: "Planos" },
              { to: "/sobre-nos", label: "Sobre Nós" },
              { to: "/contato", label: "Contato" }
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-700 font-medium hover:text-[#006D5B] hover:bg-gray-50 transition-colors py-3 px-2 border-b border-gray-50 last:border-0"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Botões Animados dentro do menu para mobile */}
          {!user && (
            <div className="flex flex-col gap-2 mt-4 px-3 sm:hidden">
              <Button
                className="w-full bg-transparent border border-[#006D5B] text-[#006D5B] font-medium transition-all duration-300 hover:bg-[#006D5B] hover:text-white active:bg-[#006D5B] active:text-white active:scale-[0.98]"
                variant="outline"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Fazer Login
              </Button>
              <Button
                className="w-full bg-[#006D5B] text-white font-medium shadow-sm transition-all duration-300 hover:bg-[#005a4b] active:bg-[#006D5B] active:scale-[0.98]"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Cadastrar
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};