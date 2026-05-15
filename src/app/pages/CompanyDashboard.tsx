import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Users,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { closeJob, createJob, listJobs } from '../services/api';
import type { Service } from '../types';
import { toast } from 'sonner';

type DashboardJob = Service & {
  status: 'open' | 'closed';
  applicantsCount: number;
};

type ContractType = 'CLT' | 'PJ' | 'FREELA' | 'EMPREITADA';

type CreateJobFormState = {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  deadline: string;
  city: string;
  state: string;
  category: string;
  contractType: ContractType;
  featured: boolean;
  urgent: boolean;
  coinCost: string;
};

const normalizeJobStatus = (status?: string): 'open' | 'closed' => {
  const value = String(status || 'OPEN').toUpperCase();
  return value === 'CLOSED' ? 'closed' : 'open';
};

const createInitialForm = (): CreateJobFormState => ({
  title: '',
  description: '',
  shortDescription: '',
  price: '',
  deadline: '',
  city: '',
  state: '',
  category: '',
  contractType: 'FREELA',
  featured: false,
  urgent: false,
  coinCost: '',
});

export const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingJobId, setClosingJobId] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [publishingJob, setPublishingJob] = useState(false);
  const [createForm, setCreateForm] = useState<CreateJobFormState>(() => createInitialForm());

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await listJobs();
      const normalized: DashboardJob[] = data.map((job) => ({
        ...job,
        status: normalizeJobStatus(job.status),
        applicantsCount: Number(job.applicantsCount || 0),
      }));
      setJobs(normalized);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      toast.error('Nao foi possivel carregar as vagas da empresa.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCloseJob = async (jobId: string) => {
    try {
      setClosingJobId(jobId);
      await closeJob(jobId);
      toast.success('Vaga fechada com sucesso.');
      await loadJobs();
    } catch (error) {
      console.error('Erro ao fechar vaga:', error);
      toast.error('Nao foi possivel fechar a vaga.');
    } finally {
      setClosingJobId(null);
    }
  };

  const updateCreateForm = <K extends keyof CreateJobFormState>(
    key: K,
    value: CreateJobFormState[K]
  ) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetCreateForm = () => {
    setCreateForm(createInitialForm());
  };

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    resetCreateForm();
  };

  const handleCreateJob = async () => {
    const requiredTextFields: Array<keyof CreateJobFormState> = [
      'title',
      'description',
      'city',
      'state',
      'category',
      'price',
      'deadline',
    ];

    const hasEmptyRequiredField = requiredTextFields.some((field) => !String(createForm[field]).trim());
    if (hasEmptyRequiredField) {
      toast.error('Preencha os campos obrigatorios para publicar a vaga.');
      return;
    }

    const price = Number(createForm.price);
    const deadline = Number(createForm.deadline);
    const coinCost = createForm.coinCost.trim() ? Number(createForm.coinCost) : undefined;

    if (!Number.isFinite(price) || price < 0) {
      toast.error('Informe um valor valido para o preco.');
      return;
    }

    if (!Number.isFinite(deadline) || deadline < 1) {
      toast.error('Informe um prazo valido (minimo de 1 dia).');
      return;
    }

    if (coinCost !== undefined && (!Number.isFinite(coinCost) || coinCost < 0)) {
      toast.error('Informe um custo de moedas valido.');
      return;
    }

    try {
      setPublishingJob(true);
      await createJob({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        shortDescription: createForm.shortDescription.trim() || undefined,
        price,
        deadline,
        city: createForm.city.trim(),
        state: createForm.state.trim().toUpperCase(),
        category: createForm.category.trim(),
        contractType: createForm.contractType,
        featured: createForm.featured,
        urgent: createForm.urgent,
        coinCost,
      });

      toast.success('Vaga publicada com sucesso.');
      closeCreateDialog();
      await loadJobs();
    } catch (error: any) {
      console.error('Erro ao publicar vaga:', error);
      toast.error(error?.message || 'Nao foi possivel publicar a vaga.');
    } finally {
      setPublishingJob(false);
    }
  };

  const filteredJobs = useMemo(
    () =>
      jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [jobs, searchTerm]
  );

  const stats = useMemo(
    () => ({
      activeJobs: jobs.filter((job) => job.status === 'open').length,
      closedJobs: jobs.filter((job) => job.status === 'closed').length,
      totalCandidates: jobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0),
    }),
    [jobs]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Dialog
        open={createDialogOpen}
        onOpenChange={(nextOpen) => {
          if (publishingJob) return;
          setCreateDialogOpen(nextOpen);
          if (!nextOpen) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Publicar Nova Vaga</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova vaga usando o endpoint do backend.
            </DialogDescription>
          </DialogHeader>

          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="job-title">Titulo</Label>
              <Input
                id="job-title"
                value={createForm.title}
                onChange={(e) => updateCreateForm('title', e.target.value)}
                placeholder="Ex.: Costureira para linha de producao"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="job-short-description">Descricao curta (opcional)</Label>
              <Input
                id="job-short-description"
                value={createForm.shortDescription}
                onChange={(e) => updateCreateForm('shortDescription', e.target.value)}
                placeholder="Resumo rapido para cards"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="job-description">Descricao</Label>
              <Textarea
                id="job-description"
                value={createForm.description}
                onChange={(e) => updateCreateForm('description', e.target.value)}
                rows={5}
                placeholder="Descreva requisitos, escopo e detalhes da vaga"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-price">Preco (R$)</Label>
              <Input
                id="job-price"
                type="number"
                min={0}
                value={createForm.price}
                onChange={(e) => updateCreateForm('price', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-deadline">Prazo (dias)</Label>
              <Input
                id="job-deadline"
                type="number"
                min={1}
                value={createForm.deadline}
                onChange={(e) => updateCreateForm('deadline', e.target.value)}
                placeholder="7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-city">Cidade</Label>
              <Input
                id="job-city"
                value={createForm.city}
                onChange={(e) => updateCreateForm('city', e.target.value)}
                placeholder="Recife"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-state">Estado</Label>
              <Input
                id="job-state"
                maxLength={2}
                value={createForm.state}
                onChange={(e) => updateCreateForm('state', e.target.value.toUpperCase())}
                placeholder="PE"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-category">Categoria</Label>
              <Input
                id="job-category"
                value={createForm.category}
                onChange={(e) => updateCreateForm('category', e.target.value)}
                placeholder="Moda feminina"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de contrato</Label>
              <Select
                value={createForm.contractType}
                onValueChange={(value) => updateCreateForm('contractType', value as ContractType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="PJ">PJ</SelectItem>
                  <SelectItem value="FREELA">Freela</SelectItem>
                  <SelectItem value="EMPREITADA">Empreitada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-coin-cost">Custo em moedas (opcional)</Label>
              <Input
                id="job-coin-cost"
                type="number"
                min={0}
                value={createForm.coinCost}
                onChange={(e) => updateCreateForm('coinCost', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Vaga em destaque</p>
                <p className="text-xs text-gray-500">Aparece no carrossel de destaque</p>
              </div>
              <Switch
                checked={createForm.featured}
                onCheckedChange={(checked) => updateCreateForm('featured', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Urgente</p>
                <p className="text-xs text-gray-500">Sinaliza prioridade para candidaturas</p>
              </div>
              <Switch
                checked={createForm.urgent}
                onCheckedChange={(checked) => updateCreateForm('urgent', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeCreateDialog} disabled={publishingJob}>
              Cancelar
            </Button>
            <Button onClick={handleCreateJob} disabled={publishingJob}>
              {publishingJob ? 'Publicando...' : 'Publicar Vaga'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel da Empresa</h1>
          <p className="text-gray-600 mt-1">Gerencie suas vagas e visualize candidatos.</p>
        </div>
        <Button className="bg-[#006D5B] hover:bg-[#005a4b] flex items-center gap-2" onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="w-5 h-5" />
          Publicar Nova Vaga
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Vagas Ativas</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeJobs}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Candidatos</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalCandidates}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Vagas Fechadas</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.closedJobs}</h3>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar vagas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={loadJobs}>
          <Filter className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        {job.status === 'open' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Fechada</Badge>
                        )}
                        <Badge variant="outline">{job.category}</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.city} - {job.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          R$ {job.price.toLocaleString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Publicado em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 md:mb-0">{job.shortDescription}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[220px]">
                      <div className="text-center w-full bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Candidatos</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <Users className="w-5 h-5 text-blue-700" />
                          <span className="text-2xl font-bold text-blue-800">{job.applicantsCount}</span>
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => navigate(`/empresa/vaga/${job.id}/candidatos`)}>
                        Ver Candidatos
                      </Button>

                      {job.status === 'open' && (
                        <Button
                          variant="outline"
                          className="w-full border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleCloseJob(job.id)}
                          disabled={closingJobId === job.id}
                        >
                          {closingJobId === job.id ? 'Fechando...' : 'Fechar Vaga'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhuma vaga encontrada</h3>
              <p className="text-gray-500 mt-1">Tente ajustar sua busca ou publique uma nova vaga.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
