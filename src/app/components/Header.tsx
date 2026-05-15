import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(true);
  // Usar useRef aqui impede que a tela fique piscando/recarregando a cada milímetro rolado
  const lastScrollY = useRef(0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Se estiver lá no topo, sempre mostra e reseta o menu
      if (currentScrollY < 50) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
      }
      // 2. Rolou para baixo (com margem de 10px para evitar toques acidentais)
      else if (currentScrollY > lastScrollY.current + 10) {
        setIsVisible(false);
        setMobileMenuOpen(false); // Fecha o menu por segurança se estava aberto
        lastScrollY.current = currentScrollY;
      }
      // 3. Rolou para cima (com margem de 10px)
      else if (currentScrollY < lastScrollY.current - 10) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      {/* Contêiner Principal da Barra */}
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src={logo}
              alt="Logo Achei Costura"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
            <span className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">

            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
            <Link to="/"className="text-sm xl:text-base font-medium text-gray-700 hover:text-[#006D5B] transition-colors duration-300">Início</Link>
            <Link to="/home" className="text-sm xl:text-base font-medium text-gray-700 hover:text-[#006D5B] transition-colors duration-300">Serviços</Link>
            <Link to="/my-applications" className="text-sm xl:text-base font-medium text-gray-700 hover:text-[#006D5B] transition-colors duration-300">Candidaturas</Link>
            <Link to="/empresa/dashboard" className="text-sm xl:text-base font-medium text-gray-700 hover:text-[#006D5B] transition-colors duration-300">Vagas</Link>
            <Link to="/empresa/buscar" className="text-sm xl:text-base font-medium text-gray-700 hover:text-[#006D5B] transition-colors duration-300">Costureiros</Link>
            <Link to="/planos" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors duration-300">Planos</Link>
            <Link to="/sobre-nos" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors duration-300">Sobre Nós</Link>
            <Link to="/contato" className="text-gray-700 hover:text-[#006D5B] font-medium transition-colors duration-300">Contato</Link>
          </nav>

          {/* User Section & Mobile Toggle */}
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
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 outline-none">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src={user.avatar} alt={user.name || 'Usuário'} className="object-cover" />
                        <AvatarFallback className="bg-gray-100 text-gray-700 font-medium">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[100px] truncate">
                        {user.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuLabel className="font-medium text-gray-900">Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate('/perfil')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>

                    <DropdownMenuItem className="sm:hidden cursor-default text-amber-600">
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
              // Botões Animados para Desktop
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  className="bg-transparent text-[#006D5B] font-medium transition-all duration-300 ease-in-out hover:bg-[#006D5B] hover:text-white hover:scale-105 active:scale-95"
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-[#006D5B] text-white font-medium shadow-sm transition-all duration-300 ease-in-out hover:bg-[#005a4b] hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Cadastrar
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-300 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown - Agora é Absolute (Flutuante sobre a tela) */}
      <nav
        className={`lg:hidden absolute top-full left-0 w-full bg-white transition-all duration-300 ease-in-out overflow-hidden shadow-xl border-t border-gray-100 ${mobileMenuOpen
            ? "max-h-[600px] opacity-100 pointer-events-auto"
            : "max-h-0 opacity-0 border-none pointer-events-none"
          }`}
      >
        <div className="container mx-auto px-4 pt-2 pb-5 flex flex-col gap-1">
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
              className="text-gray-700 font-medium hover:text-[#006D5B] hover:bg-[#006D5B]/5 transition-colors duration-300 py-3 px-3 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Botões Animados dentro do menu para mobile */}
          {!user && (
            <div className="flex flex-col gap-2 mt-2 px-3 sm:hidden">
              <Button
                className="w-full bg-transparent border border-[#006D5B] text-[#006D5B] font-medium transition-all duration-300 ease-in-out hover:bg-[#006D5B] hover:text-white active:bg-[#006D5B] active:text-white active:scale-[0.98]"
                variant="outline"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Fazer Login
              </Button>
              <Button
                className="w-full bg-[#006D5B] text-white font-medium shadow-sm transition-all duration-300 ease-in-out hover:bg-[#005a4b] hover:shadow-md active:bg-[#005a4b] active:scale-[0.98]"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Cadastrar
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};