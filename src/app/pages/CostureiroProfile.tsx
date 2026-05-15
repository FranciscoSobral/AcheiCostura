import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';;
import { useAuth } from '../context/AuthContext';
import {
  fetchCouturierById,
  fetchProfileImage,
  fetchOtherImages,
  getEnterpriseCoinsBalance,
  getEnterpriseUnlockedProfiles,
  unlockCouturierProfile,
} from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings,
  Star,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

type CostureiroProfileDTO = {
  id: string;
  name: string;
  category: string;
  type: string;
  ratingAverage: number;
  verified: boolean;
  unlocked: boolean;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  city: string;
  state: string;
  country: string;
  street: string;
  zipCode: string;
  sewingExperienceYears: string;
  teamSize: string;
  availability: string;
  specialty: string;
  machines: string[];
  factionType: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
};

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop';
const COVER_IMAGE =
  'https://images.unsplash.com/photo-1615799998603-7c6270a45196?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

const parseListField = (value?: string | string[]) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const maskPhone = (value?: string) => {
  if (!value) return '(**) *****-****';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8) return '(**) *****-****';

  const ddd = digits.slice(0, 2);
  const last4 = digits.slice(-4);
  return `(${ddd}) *****-${last4}`;
};

const maskEmail = (value?: string) => {
  if (!value || !value.includes('@')) return 'contato@*****.***';
  const [name, domain] = value.split('@');
  if (!name || !domain) return 'contato@*****.***';
  const prefix = name.slice(0, 2) || 'co';
  return `${prefix}***@${domain}`;
};

const normalizeAvailability = (value?: string) => {
  const map: Record<string, string> = {
    MORNING: 'Manha',
    AFTERNOON: 'Tarde',
    NIGHT: 'Noite',
    MORNING_AFTERNOON: 'Manha e tarde',
    WEEKENDS: 'Finais de semana',
    FULL_TIME: 'Tempo integral',
  };
  return map[value || ''] || value || 'Nao informado';
};

const normalizeTeamSize = (value?: string) => {
  const map: Record<string, string> = {
    alone: 'Sozinho(a)',
    solo: 'Sozinho(a)',
    small_team: 'Equipe pequena',
    medium_team: 'Equipe media',
    large_team: 'Equipe grande',
  };
  return map[value || ''] || value || 'Nao informado';
};

const mapCouturier = (
  dto: any,
  imageCache: Record<string, string>
): CostureiroProfileDTO => ({
  id: dto.id,
  name: dto.name || 'Profissional',
  category: dto.category || 'Costura Geral',
  type: dto.type || 'Nao informado',
  ratingAverage: dto.ratingAverage ?? dto.rating ?? 0,
  verified: Boolean(dto.verified),
  unlocked: Boolean(dto.unlocked),
  description:
    dto.description ||
    'Perfil de costureiro(a) com experiencia em producao, ajustes e acabamento.',
  email: dto.email || '',
  phone: dto.phone || '',
  whatsapp: dto.whatsapp || '',
  instagram: dto.instagram || '',
  website: dto.website || '',
  city: dto.city || '',
  state: dto.state || '',
  country: dto.country || '',
  street: dto.street || '',
  zipCode: dto.zipCode || '',
  sewingExperienceYears: dto.sewingExperienceYears || '',
  teamSize: dto.teamSize || '',
  availability: dto.availability || '',
  specialty: dto.specialty || '',
  machines: parseListField(dto.machines),
  factionType: parseListField(dto.factionType),
  createdAt: dto.createdAt || '',
  updatedAt: dto.updatedAt || '',
  imageUrl: imageCache[dto.id] || DEFAULT_AVATAR_URL,
});

export const CostureiroProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateCoins } = useAuth();

  const [profile, setProfile] = useState<CostureiroProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [desbloqueando, setDesbloqueando] = useState(false);
  const [otherImages, setOtherImages] = useState<string[]>([]);
  const [loadingOtherImages, setLoadingOtherImages] = useState(false);
  const imageCacheRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const syncEnterpriseBalance = async () => {
      if (!user?.id) return;
      try {
        const balance = await getEnterpriseCoinsBalance(user.id);
        updateCoins(balance);
      } catch (error) {
        console.error('Erro ao sincronizar saldo da empresa:', error);
      }
    };

    syncEnterpriseBalance();
  }, [user?.id]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const [dto, unlockedProfiles] = await Promise.all([
          fetchCouturierById(id, Boolean(user?.id)),
          user?.id
            ? getEnterpriseUnlockedProfiles(user.id).catch(() => [])
            : Promise.resolve([]),
        ]);

        if (!active) return;

        const unlockedIds = new Set(
          unlockedProfiles
            .map((item) => item?.couturierId)
            .filter((profileId): profileId is string => Boolean(profileId))
        );

        const mapped = mapCouturier(dto, imageCacheRef.current);
        mapped.unlocked = mapped.unlocked || unlockedIds.has(dto.id);
        setProfile(mapped);

        if (mapped.unlocked && !imageCacheRef.current[mapped.id]) {
          const imageData = await fetchProfileImage(mapped.id);
          if (!active || !imageData) return;

          imageCacheRef.current[mapped.id] = imageData;
          setProfile((prev) => (prev ? { ...prev, imageUrl: imageData } : prev));
        }

        // AGORA BUSCA AS FOTOS DA GALERIA SEMPRE
        setLoadingOtherImages(true);
        try {
          const images = await fetchOtherImages(mapped.id);
          if (active) setOtherImages(images);
        } catch (err) {
          console.error('Erro ao carregar outras imagens:', err);
        } finally {
          if (active) setLoadingOtherImages(false);
        }
        
      } catch (error: any) {
        if (active) {
          setProfile(null);
          toast.error(error?.message || 'Nao foi possivel carregar este perfil.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const handleUnlock = async () => {
    if (!profile) return;
    if (!user) {
      toast.error('Voce precisa estar logado para desbloquear perfil.');
      return;
    }

    const enterpriseId = user.id;
    if (!enterpriseId) {
      toast.error('Nao foi possivel identificar a empresa logada.');
      return;
    }

    setDesbloqueando(true);
    try {
      const currentBalance = await getEnterpriseCoinsBalance(enterpriseId);
      updateCoins(currentBalance);

      if (currentBalance < 1) {
        toast.error('Saldo de moedas insuficiente.');
        return;
      }

      await unlockCouturierProfile(enterpriseId, profile.id);

      const updatedBalance = await getEnterpriseCoinsBalance(enterpriseId);
      updateCoins(updatedBalance);

      setProfile((prev) => (prev ? { ...prev, unlocked: true } : prev));

      const imageData = await fetchProfileImage(profile.id);
      if (imageData) {
        imageCacheRef.current[profile.id] = imageData;
        setProfile((prev) => (prev ? { ...prev, imageUrl: imageData } : prev));
      }

      try {
        const images = await fetchOtherImages(profile.id);
        setOtherImages(images);
      } catch (err) {
        console.error('Erro ao recarregar outras imagens:', err);
      }

      toast.success(`Perfil de ${profile.name} desbloqueado com sucesso.`);
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel desbloquear este perfil.');
    } finally {
      setDesbloqueando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0FAF8] pt-24 px-4 flex justify-center items-start">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full max-w-4xl">
          <div className="w-full h-48 bg-gray-200 rounded-xl" />
          <div className="w-32 h-32 bg-gray-200 rounded-full -mt-16 border-4 border-white" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F0FAF8] pt-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil nao encontrado</h2>
              <p className="text-gray-500 mb-8">
                O costureiro solicitado nao foi encontrado ou nao esta disponivel no momento.
              </p>
              <Button
                onClick={() => navigate('/empresa/buscar')}
                className="bg-[#006D5B] hover:bg-[#005a4b] text-white rounded-full px-8 py-6"
              >
                Voltar para a busca
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLocked = !profile.unlocked;
  const location = [profile.city, profile.state].filter(Boolean).join(' - ') || 'Local nao informado';
  const fullAddress =
    [profile.street, profile.city, profile.state, profile.country, profile.zipCode]
      .filter(Boolean)
      .join(' - ') || 'Nao informado';

  return (
    <div className="min-h-screen bg-[#F0FAF8] pb-12 pt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            className="mb-6 text-[#006D5B] hover:bg-[#E6F3F0] rounded-full"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg rounded-3xl bg-white mb-8">
            <CardContent className="p-0">
              <div className="h-48 md:h-64 relative">
                <img src={COVER_IMAGE} alt="Capa" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div className="px-6 md:px-12 pb-8 relative">
                {/* 1. TIREI O -mt-16 DAQUI */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                  
                  {/* 2. COLOQUEI O -mt-16 APENAS NA FOTO */}
                  <div className="-mt-16 w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl flex-shrink-0 z-10">
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className={`w-full h-full object-cover transition-all duration-700 ${isLocked ? 'blur-[12px] scale-110 grayscale' : 'blur-0 scale-100'}`}
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                      }}
                    />
                  </div>

                  {/* 3. O TEXTO AGORA FICA LIVRE PARA DESCER */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {isLocked ? 'Profissional Desbloqueavel' : profile.name}
                      </h1>
                      {profile.verified && (
                        <CheckCircle className="w-6 h-6 text-[#006D5B]" title="Perfil verificado" />
                      )}
                    </div>
                    <p className="text-[#006D5B] font-semibold text-lg">{profile.category}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-gray-600">
                      <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <MapPin className="w-4 h-4 text-[#006D5B]" /> {location}
                      </span>
                      <span className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full text-sm text-yellow-700 font-medium">
                        <Star className="w-4 h-4 fill-current" /> {profile.ratingAverage.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-[#E6F3F0] px-3 py-1 rounded-full text-sm text-[#006D5B] font-medium">
                        <Briefcase className="w-4 h-4" /> {profile.type}
                      </span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto mt-4 md:mt-0">
                    {isLocked ? (
                      <div className="flex flex-col items-center md:items-end gap-2">
                        <Button
                          className="bg-[#006D5B] hover:bg-[#005a4b] text-white px-8 py-6 rounded-full text-lg shadow-md transition-all hover:scale-105"
                          onClick={handleUnlock}
                          disabled={desbloqueando}
                        >
                          {desbloqueando ? (
                            'Desbloqueando...'
                          ) : (
                            <>
                              <Unlock className="w-5 h-5 mr-2" />
                              Desbloquear com 1 moeda
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-gray-500 font-medium">
                          Saldo: <span className="text-[#006D5B]">{user?.coins ?? 0}</span> moedas
                        </p>
                      </div>
                    ) : (
                      <Badge className="bg-[#E6F3F0] text-[#006D5B] px-4 py-2 text-sm rounded-full border border-[#006D5B]/20">
                        Contato liberado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white h-full">
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#006D5B]" /> Sobre o profissional
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                    {isLocked
                      ? 'Desbloqueie o perfil para ver a descricao completa e todas as informacoes profissionais.'
                      : profile.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-10 border-t border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#E6F3F0] p-3 rounded-2xl">
                        <Briefcase className="w-6 h-6 text-[#006D5B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Experiencia</h4>
                        <p className="text-gray-600">
                          {profile.sewingExperienceYears
                            ? `${profile.sewingExperienceYears} anos na area`
                            : 'Nao informado'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-[#E6F3F0] p-3 rounded-2xl">
                        <Calendar className="w-6 h-6 text-[#006D5B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Disponibilidade</h4>
                        <p className="text-gray-600">{normalizeAvailability(profile.availability)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-[#E6F3F0] p-3 rounded-2xl">
                        <Clock className="w-6 h-6 text-[#006D5B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Tamanho da equipe</h4>
                        <p className="text-gray-600">{normalizeTeamSize(profile.teamSize)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-[#E6F3F0] p-3 rounded-2xl">
                        <MapPin className="w-6 h-6 text-[#006D5B]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Endereco</h4>
                        <p className="text-gray-600">{isLocked ? 'Desbloqueie para visualizar' : fullAddress}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-[#006D5B]" /> Maquinario disponivel
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {isLocked ? (
                          <p className="text-gray-500 italic text-sm">Desbloqueie para visualizar</p>
                        ) : profile.machines.length > 0 ? (
                          profile.machines.map((machine, index) => (
                            <Badge
                              key={`${machine}-${index}`}
                              variant="outline"
                              className="border-[#006D5B]/20 bg-[#F0FAF8] text-[#006D5B] px-3 py-1 font-medium rounded-lg"
                            >
                              {machine}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500 italic text-sm">Nao informado</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#006D5B]" /> Especialidades e faccao
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {isLocked ? (
                          <p className="text-gray-500 italic text-sm">Desbloqueie para visualizar</p>
                        ) : (
                          <>
                            {profile.specialty && (
                              <Badge className="bg-[#006D5B] text-white px-3 py-1 font-medium rounded-lg hover:bg-[#005a4b]">
                                {profile.specialty}
                              </Badge>
                            )}
                            {profile.factionType.map((faction, index) => (
                              <Badge
                                key={`${faction}-${index}`}
                                className="bg-[#006D5B] text-white px-3 py-1 font-medium rounded-lg hover:bg-[#005a4b]"
                              >
                                {faction}
                              </Badge>
                            ))}
                            {!profile.specialty && profile.factionType.length === 0 && (
                              <p className="text-gray-500 italic text-sm">Nao informado</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#006D5B]" /> Outras imagens
                    </h3>
                    {loadingOtherImages && (
                      <span className="text-xs text-gray-500">Carregando...</span>
                    )}
                  </div>

                  {otherImages.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center">
                      Nenhuma imagem adicional encontrada para este profissional.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {otherImages.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                        >
                          <img
                            src={url}
                            alt={`Galeria ${idx + 1}`}
                            className="w-full h-32 sm:h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
                <div className="h-2 bg-[#006D5B]" />
                <CardContent className="p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Informacoes de contato</h2>

                  {isLocked ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 text-gray-500 grayscale opacity-60">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-sm">{maskPhone(profile.phone)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500 grayscale opacity-60">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-sm">{maskEmail(profile.email)}</span>
                      </div>

                      <div className="mt-8 p-4 rounded-2xl bg-[#F0FAF8] border border-dashed border-[#006D5B]/30 flex flex-col items-center text-center gap-3">
                        <div className="bg-[#006D5B]/10 p-3 rounded-full">
                          <Lock className="w-6 h-6 text-[#006D5B]" />
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          Desbloqueie para ver telefone, whatsapp, email, instagram e website completos.
                        </p>
                        <Button
                          variant="link"
                          className="text-[#006D5B] font-bold p-0 h-auto"
                          onClick={handleUnlock}
                        >
                          Liberar agora
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="bg-[#E6F3F0] p-2.5 rounded-xl">
                          <Phone className="w-5 h-5 text-[#006D5B]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                            Telefone / WhatsApp
                          </p>
                          <p className="font-semibold text-lg">{profile.phone || 'Nao informado'}</p>
                          <p className="text-sm text-gray-600">{profile.whatsapp || 'Nao informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="bg-[#E6F3F0] p-2.5 rounded-xl">
                          <Mail className="w-5 h-5 text-[#006D5B]" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                            E-mail profissional
                          </p>
                          <p className="font-semibold text-lg truncate">{profile.email || 'Nao informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="bg-[#E6F3F0] p-2.5 rounded-xl">
                          <Instagram className="w-5 h-5 text-[#006D5B]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Instagram</p>
                          <p className="font-semibold text-lg">{profile.instagram || 'Nao informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-gray-700">
                        <div className="bg-[#E6F3F0] p-2.5 rounded-xl">
                          <Globe className="w-5 h-5 text-[#006D5B]" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Website</p>
                          <p className="font-semibold text-lg truncate">{profile.website || 'Nao informado'}</p>
                        </div>
                      </div>

                      <Button className="w-full mt-4 bg-[#006D5B] hover:bg-[#005a4b] text-white rounded-xl py-6 shadow-md">
                        Enviar proposta direta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-white">
                <CardContent className="p-8 space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Metadados do perfil</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">ID:</span> {profile.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Criado em:</span>{' '}
                    {profile.createdAt || 'Nao informado'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Atualizado em:</span>{' '}
                    {profile.updatedAt || 'Nao informado'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm rounded-3xl bg-[#006D5B] text-white">
                <CardContent className="p-8">
                  <h3 className="text-lg font-bold mb-4">Gerenciar moedas</h3>
                  <div className="flex items-center justify-between mb-6">
                    <span className="opacity-80">Saldo disponivel:</span>
                    <span className="text-2xl font-bold">{user?.coins ?? 0}</span>
                  </div>
                  <Link to="/planos">
                    <Button
                      variant="secondary"
                      className="w-full bg-white text-[#006D5B] hover:bg-gray-100 rounded-xl font-bold py-6"
                    >
                      Recarregar moedas
                    </Button>
                  </Link>
                  <p className="text-xs mt-4 opacity-70 text-center">
                    Cada desbloqueio custa 1 moeda e fica salvo para sua empresa.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostureiroProfile;