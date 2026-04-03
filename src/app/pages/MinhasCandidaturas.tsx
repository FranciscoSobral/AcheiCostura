import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Briefcase, Calendar, MapPin, Clock, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { fetchServiceById, listMyApplications } from '../services/api';
import type { Service } from '../types';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  category: string;
  city: string;
  state: string;
  price: number;
  deadline: number;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  message?: string;
  coinCost?: number;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  accepted: {
    label: 'Aceita',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Recusada',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

const mapApiStatusToUi = (status: string): Application['status'] => {
  const upper = (status || '').toUpperCase();
  if (upper === 'ACCEPTED') return 'accepted';
  if (upper === 'REJECTED') return 'rejected';
  return 'pending';
};

export function MinhasCandidaturas() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apiApplications = await listMyApplications();

      const uniqueJobIds = Array.from(
        new Set(
          apiApplications
            .map((app) => app.job?.id)
            .filter((id): id is string => Boolean(id))
        )
      );

      const jobs = new Map<string, Service | null>();
      await Promise.all(
        uniqueJobIds.map(async (jobId) => {
          const job = await fetchServiceById(jobId);
          jobs.set(jobId, job);
        })
      );

      const normalized: Application[] = apiApplications.map((app) => {
        const jobId = app.job?.id || '';
        const job = jobId ? jobs.get(jobId) : null;
        return {
          id: app.id,
          jobId,
          jobTitle: app.job?.title || job?.title || 'Oportunidade',
          company: job?.company?.name || 'Empresa',
          companyLogo: job?.company?.logo,
          category: job?.category || 'N/A',
          city: job?.city || job?.company?.city || '',
          state: job?.state || job?.company?.state || '',
          price: job?.price || 0,
          deadline: job?.deadline || 0,
          status: mapApiStatusToUi(app.status),
          appliedAt: app.createdAt,
          message: app.message,
          coinCost: job?.coinCost,
        };
      });

      setApplications(normalized);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      toast.error('Erro ao carregar suas candidaturas');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (selectedTab === 'all') return true;
    return app.status === selectedTab;
  });

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando suas candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Candidaturas</h1>
          <p className="text-gray-600">
            Acompanhe o status de todas as suas candidaturas a serviços
          </p>
        </div>

        {/* Tabs com Filtros */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="relative">
              Todas
              <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700">
                {stats.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                {stats.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Aceitas
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                {stats.accepted}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Recusadas
              <Badge variant="secondary" className="ml-2 bg-red-100 text-red-700">
                {stats.rejected}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {filteredApplications.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhuma candidatura encontrada
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    {selectedTab === 'all' 
                      ? 'Você ainda não se candidatou a nenhum serviço. Explore as oportunidades disponíveis!'
                      : `Você não tem candidaturas ${STATUS_CONFIG[selectedTab as keyof typeof STATUS_CONFIG]?.label.toLowerCase()}.`
                    }
                  </p>
                  <Link to="/">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Explorar Serviços
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const StatusIcon = STATUS_CONFIG[application.status].icon;
                  
                  return (
                    <Card key={application.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Logo da Empresa */}
                            {application.companyLogo && (
                              <img
                                src={application.companyLogo}
                                alt={application.company}
                                className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-2">
                                <CardTitle className="text-xl leading-tight">
                                  {application.jobTitle}
                                </CardTitle>
                              </div>
                              
                              <CardDescription className="text-base">
                                {application.company}
                              </CardDescription>
                              
                              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{application.category}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{application.city}, {application.state}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{application.deadline} dias</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge 
                            className={`${STATUS_CONFIG[application.status].color} border px-3 py-1 text-sm font-medium flex items-center gap-1.5 whitespace-nowrap`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {STATUS_CONFIG[application.status].label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-3 border-t">
                          <div className="flex flex-wrap items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Valor do Serviço</p>
                              <p className="text-lg font-bold text-green-600">
                                R$ {application.price.toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="h-8 w-px bg-gray-200 hidden lg:block" />
                            
                            <div>
                              <p className="text-sm text-gray-500">Data da Candidatura</p>
                              <p className="text-sm font-medium text-gray-700">
                                {formatDate(application.appliedAt)}
                              </p>
                            </div>

                            {application.coinCost && (
                              <>
                                <div className="h-8 w-px bg-gray-200 hidden lg:block" />
                                <div>
                                  <p className="text-sm text-gray-500">Moedas Gastas</p>
                                  <p className="text-sm font-medium text-gray-700">
                                    {application.coinCost} 🪙
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          <Link to={`/service/${application.jobId}`}>
                            <Button variant="outline" className="w-full lg:w-auto border-green-200 hover:bg-green-50 hover:text-green-700">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>

                        {application.message && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">Sua mensagem:</p>
                            <p className="text-sm text-gray-600 italic">&ldquo;{application.message}&rdquo;</p>
                          </div>
                        )}

                        {application.status === 'accepted' && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-green-900 mb-1">
                                  Parabéns! Sua candidatura foi aceita
                                </p>
                                <p className="text-sm text-green-700">
                                  A empresa entrará em contato em breve para dar continuidade ao serviço.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {application.status === 'rejected' && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-red-900 mb-1">
                                  Candidatura não selecionada
                                </p>
                                <p className="text-sm text-red-700">
                                  Não desanime! Continue se candidatando a outras oportunidades.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        {applications.length > 0 && (
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 mt-8">
            <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-4 py-6">
              <div>
                <h3 className="text-xl font-bold mb-1">Encontre Mais Oportunidades</h3>
                <p className="text-green-100">
                  Explore novos serviços e aumente suas chances de conseguir trabalho
                </p>
              </div>
              <Link to="/">
                <Button 
                  size="lg" 
                  className="bg-white text-green-700 hover:bg-gray-100 font-semibold"
                >
                  Ver Serviços Disponíveis
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
