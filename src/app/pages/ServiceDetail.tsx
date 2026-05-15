import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Service } from '../types';
import { fetchServiceById, applyToService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  BadgeCheck,
  CheckCircle,
  Coins,
  Calendar,
  Briefcase,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, updateCoins } = useAuth();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadService = async () => {
      if (!id) return;

      try {
        const data = await fetchServiceById(id);
        setService(data);
      } catch (error) {
        console.error('Erro ao carregar serviço:', error);
        toast.error('Erro ao carregar detalhes do serviço');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para se candidatar');
      navigate('/login');
      return;
    }

    if (!service) return;

    if (service.coinCost && user.coins < service.coinCost) {
      toast.error(`Você precisa de ${service.coinCost} moedas para se candidatar a este serviço`);
      return;
    }

    if (!message.trim()) {
      toast.error('Por favor, escreva uma mensagem de apresentação');
      return;
    }

    setApplying(true);

    try {
      await applyToService(service.id, message);

      // Atualizar moedas se o serviço tem custo
      if (service.coinCost) {
        updateCoins(user.coins - service.coinCost);
      }

      toast.success('Candidatura enviada com sucesso!');
      setService({ ...service, applied: true });
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar candidatura');
    } finally {
      setApplying(false);
    }
  };

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return `${days} dias atrás`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Serviço não encontrado</AlertDescription>
          </Alert>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar para a home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>

        {/* Service Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="space-y-4">
              {/* Company Info */}
              <div className="flex items-start gap-4">
                {service.company.logo ? (
                  <img
                    src={service.company.logo}
                    alt={service.company.name}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{service.company.name}</h3>
                    {service.company.verified && (
                      <BadgeCheck className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Publicado {getDaysAgo(service.createdAt)}
                  </p>
                </div>
              </div>

              {/* Title and Badges */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{service.category}</Badge>
                  <Badge variant="outline">{service.contractType}</Badge>
                  {service.urgent && <Badge variant="destructive">Urgente</Badge>}
                  {service.featured && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Destaque
                    </Badge>
                  )}
                  {service.applied && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Candidatura enviada
                    </Badge>
                  )}
                </div>
              </div>

              {/* Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Valor</p>
                    <p className="font-semibold text-green-700">
                      R$ {service.price.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Prazo</p>
                    <p className="font-semibold">{service.deadline} dias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Localização</p>
                    <p className="font-semibold">
                      {service.city} - {service.state}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Service Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Form */}
        {!service.applied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Candidatar-se</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Você precisa estar logado para se candidatar a este serviço
                    </AlertDescription>
                  </Alert>
                )}

                {service.coinCost && (
                  <Alert>
                    <Coins className="h-4 w-4" />
                    <AlertDescription>
                      Este é um serviço premium. Custa{' '}
                      <strong>{service.coinCost} moedas</strong> para se candidatar.
                      {user && ` Você tem ${user.coins} moedas.`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mensagem de apresentação
                  </label>
                  <Textarea
                    placeholder="Conte à empresa por que você é o profissional ideal para este serviço..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    disabled={!user}
                  />
                  <p className="text-xs text-gray-600">
                    {message.length} / 500 caracteres
                  </p>
                </div>

                <Button
                  onClick={handleApply}
                  disabled={!user || applying || !message.trim()}
                  className="w-full"
                  size="lg"
                >
                  {applying ? 'Enviando...' : 'Enviar Candidatura'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Already Applied */}
        {service.applied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold bg-[#006D5B]">
                      Candidatura enviada!
                    </h3>
                    <p className="text-sm text-green-700">
                      A empresa irá analisar seu perfil e entrar em contato.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
