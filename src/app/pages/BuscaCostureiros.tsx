import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  CheckCircle,
  Lock,
  Unlock,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle, DrawerHeader } from "../components/ui/drawer";
import { useIsMobile } from '../components/ui/use-mobile';

// Tipos e mocks locais
type CouturierDTO = {
  id: string;
  name: string;
  imageUrl: string;
  city: string;
  state: string;
  ratingAverage: number;
  category: string;
  verified: boolean;
  unlocked: boolean;
  machines: string[];
  factionType: string[];
  experienceYears: string;
  availability: string;
};

const MOCK_COUTUREIROS: CouturierDTO[] = [
  {
    id: 'c1',
    name: 'Ana Costa',
    imageUrl: 'https://images.unsplash.com/photo-1730047614191-3fc94b73c854?w=400&h=400&fit=crop',
    city: 'São Paulo',
    state: 'SP',
    ratingAverage: 4.8,
    category: 'Moda Praia',
    verified: true,
    unlocked: true,
    machines: ['Reta', 'Overloque'],
    factionType: ['Corte e Costura'],
    experienceYears: '5-10',
    availability: 'MORNING_AFTERNOON',
  },
  {
    id: 'c2',
    name: 'Maria Silva',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    city: 'Rio de Janeiro',
    state: 'RJ',
    ratingAverage: 4.9,
    category: 'Alta Costura',
    verified: false,
    unlocked: false,
    machines: ['Reta', 'Galoneira'],
    factionType: ['Moda Íntima'],
    experienceYears: '10+',
    availability: 'AFTERNOON',
  },
  {
    id: 'c3',
    name: 'Joana Prado',
    imageUrl: 'https://images.unsplash.com/photo-1759367205570-fd522fedc13a?w=400&h=400&fit=crop',
    city: 'Belo Horizonte',
    state: 'MG',
    ratingAverage: 4.5,
    category: 'Jeans',
    verified: true,
    unlocked: true,
    machines: ['Overloque', 'Ponto Cruzado'],
    factionType: ['Lavanderia'],
    experienceYears: '2-5',
    availability: 'WEEKENDS',
  },
  {
    id: 'c4',
    name: 'Clara Nunes',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    city: 'Curitiba',
    state: 'PR',
    ratingAverage: 5.0,
    category: 'Bordado',
    verified: false,
    unlocked: false,
    machines: ['Bordadeira'],
    factionType: ['Bordado'],
    experienceYears: '10+',
    availability: 'MORNING',
  }
];

const FILTROS_PADRAO = {
  search: '',
  specialty: [] as string[],
  city: '',
  machines: [] as string[],
  factionType: [] as string[],
  experienceYears: '',
  availability: '',
  minRating: 0,
  verified: false,
  sortBy: 'relevance',
};

export const BuscaCostureiros = () => {
  const navigate = useNavigate();
  const { user, updateCoins } = useAuth();
  const isMobile = useIsMobile();
  const [filtros, setFiltros] = useState(FILTROS_PADRAO);
  const [costureiros, setCostureiros] = useState<CouturierDTO[]>(MOCK_COUTUREIROS);
  const [loading, setLoading] = useState(false);
  const [desbloqueandoId, setDesbloqueandoId] = useState<string | null>(null);

  // Simula busca
  useEffect(() => {
    const fetchCostureiros = async () => {
      setLoading(true);
      // Simula delay de rede
      await new Promise(r => setTimeout(r, 600));

      let result = [...MOCK_COUTUREIROS];

      if (filtros.search) {
        const s = filtros.search.toLowerCase();
        result = result.filter(c => 
          c.name.toLowerCase().includes(s) || 
          c.category.toLowerCase().includes(s)
        );
      }
      if (filtros.city) {
        result = result.filter(c => c.city.toLowerCase().includes(filtros.city.toLowerCase()));
      }
      if (filtros.minRating > 0) {
        result = result.filter(c => c.ratingAverage >= filtros.minRating);
      }
      if (filtros.verified) {
        result = result.filter(c => c.verified);
      }
      if (filtros.specialty.length > 0) {
        result = result.filter(c => filtros.specialty.includes(c.category));
      }
      if (filtros.machines.length > 0) {
        result = result.filter(c => c.machines.some(m => filtros.machines.includes(m)));
      }
      if (filtros.experienceYears && filtros.experienceYears !== 'all') {
        result = result.filter(c => c.experienceYears === filtros.experienceYears);
      }
      if (filtros.availability && filtros.availability !== 'all') {
        result = result.filter(c => c.availability === filtros.availability);
      }

      // Sort
      if (filtros.sortBy === 'rating') {
        result.sort((a, b) => b.ratingAverage - a.ratingAverage);
      } else if (filtros.sortBy === 'experience') {
        // Mock simple sort
        result.sort((a, b) => b.experienceYears.localeCompare(a.experienceYears));
      }

      setCostureiros(result);
      setLoading(false);
    };

    const debounce = setTimeout(fetchCostureiros, 300);
    return () => clearTimeout(debounce);
  }, [filtros]);

  const handleUnlock = async (id: string, costureiroName: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para desbloquear perfis.');
      return;
    }

    // Usamos um valor padrão se user.coins for undefined
    const userCoins = user.coins || 0;

    if (userCoins < 1) {
      toast.error('Saldo de moedas insuficiente. Adquira mais moedas no seu painel.');
      return;
    }

    setDesbloqueandoId(id);
    
    // Simula API de desbloqueio
    await new Promise(r => setTimeout(r, 800));
    
    setCostureiros(prev => prev.map(c => c.id === id ? { ...c, unlocked: true } : c));
    updateCoins(userCoins - 1);
    toast.success(`Perfil de ${costureiroName} desbloqueado com sucesso!`);
    setDesbloqueandoId(null);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_PADRAO);
  };

  const renderFiltros = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </h3>
        <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-sm h-8 px-2 text-gray-500 hover:text-gray-900">
          Limpar
        </Button>
      </div>

      {/* Buscar por nome */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Nome ou especialidade" 
            className="pl-9"
            value={filtros.search}
            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
          />
        </div>
      </div>

      {/* Especialidades */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Especialidade</label>
        <div className="space-y-2">
          {['Moda Praia', 'Jeans', 'Bordado', 'Malharia', 'Alta Costura'].map(esp => (
            <div key={esp} className="flex items-center space-x-2">
              <Checkbox 
                id={`esp-${esp}`} 
                checked={filtros.specialty.includes(esp)}
                onCheckedChange={(checked) => {
                  setFiltros(prev => ({
                    ...prev,
                    specialty: checked 
                      ? [...prev.specialty, esp] 
                      : prev.specialty.filter(s => s !== esp)
                  }))
                }}
              />
              <label htmlFor={`esp-${esp}`} className="text-sm text-gray-600 cursor-pointer">{esp}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Cidade */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Cidade</label>
        <Input 
          placeholder="Digite a cidade" 
          value={filtros.city}
          onChange={(e) => setFiltros({ ...filtros, city: e.target.value })}
        />
      </div>

      {/* Avaliação Mínima */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Avaliação Mínima</label>
          <span className="text-sm text-gray-500">{filtros.minRating > 0 ? `${filtros.minRating} estrelas` : 'Qualquer'}</span>
        </div>
        <Slider 
          min={0} max={5} step={0.5} 
          value={[filtros.minRating]} 
          onValueChange={([val]) => setFiltros({ ...filtros, minRating: val })} 
        />
      </div>

      {/* Experiência */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Experiência</label>
        <Select 
          value={filtros.experienceYears} 
          onValueChange={(val) => setFiltros({ ...filtros, experienceYears: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="0-2">0-2 anos</SelectItem>
            <SelectItem value="2-5">2-5 anos</SelectItem>
            <SelectItem value="5-10">5-10 anos</SelectItem>
            <SelectItem value="10+">10+ anos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Apenas Verificados */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="verified" 
          checked={filtros.verified}
          onCheckedChange={(checked) => setFiltros({ ...filtros, verified: checked as boolean })}
        />
        <label htmlFor="verified" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-1">
          Apenas Verificados <CheckCircle className="w-3 h-3 text-green-600" />
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#006D5B] text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Encontre costureiros ideais</h1>
          <p className="text-[#E6F3F0] text-lg max-w-2xl">
            Utilize nossos filtros avançados para encontrar o profissional perfeito para sua demanda. Desbloqueie perfis para ver contato e portfólio completo.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {renderFiltros()}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Top Bar Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <p className="text-gray-600">
                Mostrando <span className="font-semibold text-gray-900">{costureiros.length}</span> resultados
              </p>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Drawer Filters - Mobile */}
                <div className="lg:hidden w-full sm:w-auto">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <SlidersHorizontal className="w-4 h-4" /> Filtros
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Filtros</DrawerTitle>
                      </DrawerHeader>
                      <div className="p-4 max-h-[70vh] overflow-y-auto">
                        {renderFiltros()}
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                <Select 
                  value={filtros.sortBy} 
                  onValueChange={(val) => setFiltros({ ...filtros, sortBy: val })}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Mais relevantes</SelectItem>
                    <SelectItem value="rating">Melhor avaliação</SelectItem>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="experience">Mais experiência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="animate-pulse h-80 bg-gray-100 border-none" />
                ))}
              </div>
            ) : costureiros.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {costureiros.map(c => {
                  const isLocked = !c.verified && !c.unlocked;
                  return (
                    <Card key={c.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col group">
                      <div className="relative h-48 bg-gray-200">
                        <img 
                          src={c.imageUrl} 
                          alt={c.name} 
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isLocked ? 'blur-[8px]' : ''}`}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-4">
                            <Lock className="w-10 h-10 mb-2 opacity-80" />
                            <span className="font-semibold text-center">Perfil Oculto</span>
                            <span className="text-xs text-center text-gray-200 mt-1">Requer desbloqueio</span>
                          </div>
                        )}
                        {c.verified && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <CheckCircle className="w-4 h-4 text-[#006D5B]" />
                            <span className="text-xs font-semibold text-[#006D5B]">Verificado</span>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                            {isLocked ? 'Profissional' : c.name}
                          </h3>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md text-yellow-700 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-sm font-semibold">{c.ratingAverage}</span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-4 gap-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{c.city}, {c.state}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-[#E6F3F0] text-[#006D5B] hover:bg-[#E6F3F0]">
                            {c.category}
                          </Badge>
                          {c.experienceYears && (
                            <Badge variant="outline" className="text-gray-600 border-gray-200">
                              {c.experienceYears} anos
                            </Badge>
                          )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                          {isLocked ? (
                            <Button 
                              className="w-full bg-[#006D5B] hover:bg-[#005a4b] text-white flex gap-2 items-center"
                              onClick={() => handleUnlock(c.id, c.name)}
                              disabled={desbloqueandoId === c.id}
                            >
                              {desbloqueandoId === c.id ? (
                                <span className="animate-pulse">Desbloqueando...</span>
                              ) : (
                                <>
                                  <Unlock className="w-4 h-4" /> Desbloquear (1 Moeda)
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              className="w-full border-[#006D5B] text-[#006D5B] hover:bg-[#F2F9F7] flex gap-2"
                              onClick={() => navigate(`/costureiro/${c.id}`)}
                            >
                              Ver Perfil Completo
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl border border-dashed border-gray-300">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum costureiro encontrado</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Não encontramos nenhum profissional com os filtros selecionados. Tente ajustar os filtros ou limpar sua busca.
                </p>
                <Button onClick={limparFiltros} variant="outline" className="border-[#006D5B] text-[#006D5B]">
                  Limpar todos os filtros
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BuscaCostureiros;
