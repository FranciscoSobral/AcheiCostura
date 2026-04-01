import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  CheckCircle, 
  Mail, 
  Phone, 
  Clock, 
  Settings, 
  Briefcase, 
  Award,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

type Review = {
  id: string;
  author: string;
  text: string;
  rating: number;
  date: string;
};

type CostureiroProfileDTO = {
  id: string;
  name: string;
  imageUrl: string;
  coverUrl: string;
  city: string;
  state: string;
  ratingAverage: number;
  category: string;
  verified: boolean;
  machines: string[];
  factionType: string[];
  experienceYears: string;
  availability: string;
  bio: string;
  email: string;
  phone: string;
  portfolio: string[];
  reviews: Review[];
};

const COVER_IMAGE = "https://images.unsplash.com/photo-1615799998603-7c6270a45196?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWJyaWMlMjB0ZXh0dXJlfGVufDF8fHx8MTc3NDM5MTUyNnww&ixlib=rb-4.1.0&q=80&w=1080";

const PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1763733593220-14b3b0a5936e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXdpbmclMjB3b3JrJTIwZHJlc3N8ZW58MXx8fHwxNzc0MzkxNTAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1769192932507-edee0acdd5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3IlMjBtZWFzdXJpbmd8ZW58MXx8fHwxNzc0MzkxNTAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1557777586-f6682739fcf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc2tldGNoZXN8ZW58MXx8fHwxNzc0MzkxNTA3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1466027397211-20d0f2449a3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXdpbmclMjBtYWNoaW5lfGVufDF8fHx8MTc3NDM5MTUxMHww&ixlib=rb-4.1.0&q=80&w=1080"
];

const MOCK_PROFILES: CostureiroProfileDTO[] = [
  {
    id: 'c1',
    name: 'Ana Costa',
    imageUrl: 'https://images.unsplash.com/photo-1730047614191-3fc94b73c854?w=400&h=400&fit=crop',
    coverUrl: COVER_IMAGE,
    city: 'São Paulo',
    state: 'SP',
    ratingAverage: 4.8,
    category: 'Moda Praia',
    verified: true,
    machines: ['Reta', 'Overloque', 'Galoneira'],
    factionType: ['Corte e Costura', 'Modelagem'],
    experienceYears: '5-10',
    availability: 'MORNING_AFTERNOON',
    bio: 'Sou especialista em moda praia com mais de 7 anos de experiência. Trabalho com tecidos delicados e tenho maquinário próprio e revisado. Garanto acabamento impecável e cumprimento de prazos rigorosos. Já atuei em confecções de médio e grande porte e atualmente atendo empresas como prestadora de serviços.',
    email: 'ana.costa.costura@email.com',
    phone: '(11) 98765-4321',
    portfolio: PORTFOLIO_IMAGES,
    reviews: [
      { id: 'r1', author: 'Confecção Sol & Mar', text: 'Excelente profissional, acabamento perfeito e entregou tudo no prazo. Recomendo muito!', rating: 5, date: '15 Fev 2026' },
      { id: 'r2', author: 'Boutique Verão', text: 'Boa comunicação e qualidade técnica acima da média.', rating: 4.5, date: '10 Jan 2026' }
    ]
  },
  {
    id: 'c2',
    name: 'Maria Silva',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    coverUrl: COVER_IMAGE,
    city: 'Rio de Janeiro',
    state: 'RJ',
    ratingAverage: 4.9,
    category: 'Alta Costura',
    verified: false,
    machines: ['Reta', 'Galoneira', 'Ponto Invisível'],
    factionType: ['Moda Íntima', 'Festa'],
    experienceYears: '10+',
    availability: 'AFTERNOON',
    bio: 'Costureira de alta precisão com 15 anos no mercado de moda íntima e festa. Experiência com rendas francesas, seda e cetim. Trabalho apenas no período da tarde, mas tenho alta produtividade e equipe de apoio se necessário.',
    email: 'maria.silva@email.com',
    phone: '(21) 99988-7766',
    portfolio: PORTFOLIO_IMAGES.slice(0, 2),
    reviews: [
      { id: 'r3', author: 'Ateliê Branco', text: 'Impecável no trabalho com vestidos de noiva. Confio de olhos fechados.', rating: 5, date: '20 Mar 2026' }
    ]
  },
  {
    id: 'c3',
    name: 'Joana Prado',
    imageUrl: 'https://images.unsplash.com/photo-1759367205570-fd522fedc13a?w=400&h=400&fit=crop',
    coverUrl: COVER_IMAGE,
    city: 'Belo Horizonte',
    state: 'MG',
    ratingAverage: 4.5,
    category: 'Jeans',
    verified: true,
    machines: ['Overloque', 'Ponto Cruzado', 'Interloque', 'Travete'],
    factionType: ['Lavanderia', 'Fechamento'],
    experienceYears: '2-5',
    availability: 'WEEKENDS',
    bio: 'Atuo focada na área de jeanswear, desde fechamento até preparação para lavanderia. Agilidade e conhecimento em maquinário pesado. Disponibilidade principal aos finais de semana para demandas pontuais e altas produções.',
    email: 'joana.prado.jeans@email.com',
    phone: '(31) 97766-5544',
    portfolio: PORTFOLIO_IMAGES.slice(1, 4),
    reviews: []
  },
  {
    id: 'c4',
    name: 'Clara Nunes',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    coverUrl: COVER_IMAGE,
    city: 'Curitiba',
    state: 'PR',
    ratingAverage: 5.0,
    category: 'Bordado',
    verified: false,
    machines: ['Bordadeira Industrial 12 Agulhas', 'Reta'],
    factionType: ['Bordado Computadorizado', 'Personalização'],
    experienceYears: '10+',
    availability: 'MORNING',
    bio: 'Especialista em bordado computadorizado. Tenho maquinário próprio de alta tecnologia capaz de produzir grandes lotes com rapidez e perfeição. Crio as matrizes se necessário.',
    email: 'clara.nunes.bordados@email.com',
    phone: '(41) 98855-2211',
    portfolio: [PORTFOLIO_IMAGES[3]],
    reviews: [
      { id: 'r4', author: 'Uniformize', text: 'Bordados perfeitos para nossos uniformes corporativos.', rating: 5, date: '05 Mar 2026' }
    ]
  }
];

export const CostureiroProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<CostureiroProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula busca
    const fetchProfile = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600));
      
      const found = MOCK_PROFILES.find(p => p.id === id);
      if (found) {
        setProfile(found);
      } else {
        toast.error('Perfil não encontrado.');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  const mapAvailability = (av: string) => {
    const map: Record<string, string> = {
      'MORNING': 'Manhã',
      'AFTERNOON': 'Tarde',
      'MORNING_AFTERNOON': 'Manhã e Tarde',
      'WEEKENDS': 'Finais de Semana',
      'FULL_TIME': 'Integral'
    };
    return map[av] || av;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006D5B]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil não encontrado</h2>
        <p className="text-gray-500 mb-6">O costureiro que você está procurando não existe ou o link é inválido.</p>
        <Button onClick={() => navigate('/empresa/buscar')} className="bg-[#006D5B] hover:bg-[#005a4b]">
          Voltar para a Busca
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header com Capa e Foto */}
      <div className="relative h-64 md:h-80 w-full bg-gray-300">
        <img 
          src={profile.coverUrl} 
          alt="Capa do Perfil" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Botão voltar */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white hover:bg-white/20 hover:text-white rounded-full bg-black/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Voltar
        </Button>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Coluna Esquerda: Informações Principais */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card className="shadow-lg border-0 overflow-visible rounded-xl">
              <CardContent className="p-6 flex flex-col items-center text-center pt-0">
                {/* Foto de Perfil */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md bg-white -mt-16 overflow-hidden relative mb-4">
                  <img 
                    src={profile.imageUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                  {profile.verified && (
                    <div className="absolute bottom-1 right-1 bg-white rounded-full">
                      <CheckCircle className="w-8 h-8 text-[#006D5B]" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                <p className="text-[#006D5B] font-medium mb-3">{profile.category}</p>

                <div className="flex items-center gap-1 text-yellow-500 mb-4 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{profile.ratingAverage}</span>
                  <span className="text-gray-500 text-sm font-normal ml-1">({profile.reviews.length} avaliações)</span>
                </div>

                <div className="w-full flex flex-col gap-3 text-sm text-gray-600 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{profile.city}, {profile.state}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Mail className="w-5 h-5 text-gray-400 shrink-0" />
                    <a href={`mailto:${profile.email}`} className="text-[#006D5B] hover:underline truncate">
                      {profile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-[#006D5B] hover:bg-[#005a4b] text-white py-6 text-lg rounded-xl shadow-md">
                  Convidar para Vaga
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 rounded-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#006D5B]" /> 
                  Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.factionType.map(type => (
                    <Badge key={type} className="bg-[#E6F3F0] text-[#006D5B] hover:bg-[#E6F3F0] px-3 py-1 font-medium">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Detalhes, Biografia, Portfólio, Avaliações */}
          <div className="w-full md:w-2/3 space-y-6">
            
            {/* Sobre Mim e Detalhes */}
            <Card className="shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre mim</h2>
                <p className="text-gray-600 leading-relaxed mb-8 text-justify">
                  {profile.bio}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#E6F3F0] p-2 rounded-lg shrink-0">
                      <Briefcase className="w-5 h-5 text-[#006D5B]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Experiência</h4>
                      <p className="text-sm text-gray-600">{profile.experienceYears} anos na área</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-[#E6F3F0] p-2 rounded-lg shrink-0">
                      <Calendar className="w-5 h-5 text-[#006D5B]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Disponibilidade</h4>
                      <p className="text-sm text-gray-600">{mapAvailability(profile.availability)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:col-span-2">
                    <div className="bg-[#E6F3F0] p-2 rounded-lg shrink-0">
                      <Settings className="w-5 h-5 text-[#006D5B]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Equipamentos e Máquinas</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.machines.map(m => (
                          <Badge key={m} variant="outline" className="border-gray-200 text-gray-700 bg-white">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfólio */}
            <Card className="shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#006D5B]" /> Portfólio
                  </h2>
                </div>
                
                {profile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.portfolio.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group relative">
                        <img 
                          src={img} 
                          alt={`Portfólio ${i + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Nenhuma foto no portfólio no momento.</p>
                )}
              </CardContent>
            </Card>

            {/* Avaliações */}
            <Card className="shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#006D5B]" /> Avaliações das Empresas
                </h2>

                {profile.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {profile.reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.author}</h4>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md text-yellow-700">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-sm font-semibold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-2">{review.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Este profissional ainda não possui avaliações.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CostureiroProfile;
