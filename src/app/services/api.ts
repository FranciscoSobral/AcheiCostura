import axios from 'axios';
import type { Service, Application, User } from '../types';

const api = axios.create({
  baseURL: '/api', // Substitua pela URL real do backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== DADOS MOCK ==========
// Em produção, essas funções farão requisições reais ao backend

const mockCompanies = [
  { id: '1', name: 'Confecção Estrela', verified: true },
  { id: '2', name: 'Moda Praia Premium', verified: true },
  { id: '3', name: 'Bordados Artesanais', verified: false },
  { id: '4', name: 'Fashion Factory', verified: true },
  { id: '5', name: 'Costura Elegante', verified: false },
];

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Costura de 100 biquínis',
    description: 'Precisamos de costureiro experiente em moda praia para produção de 100 biquínis. Material será fornecido. Necessário máquina overloque e reta.',
    shortDescription: 'Produção de 100 biquínis com material fornecido',
    price: 1500,
    deadline: 15,
    city: 'São Paulo',
    state: 'SP',
    category: 'Moda Praia',
    contractType: 'Freela',
    createdAt: '2026-02-20T10:00:00Z',
    featured: true,
    urgent: true,
    company: mockCompanies[1],
    applied: false,
  },
  {
    id: '2',
    title: 'Bordado em vestidos de festa',
    description: 'Buscamos profissional especializado em bordado à mão para 20 vestidos de festa. Trabalho delicado com pedrarias e apliques.',
    shortDescription: 'Bordado artesanal em 20 vestidos de festa',
    price: 2800,
    deadline: 30,
    city: 'Rio de Janeiro',
    state: 'RJ',
    category: 'Bordado',
    contractType: 'PJ',
    createdAt: '2026-02-19T14:30:00Z',
    featured: true,
    urgent: false,
    coinCost: 10,
    company: mockCompanies[2],
    applied: false,
  },
  {
    id: '3',
    title: 'Ajustes em roupas corporativas',
    description: 'Empresa precisa de costureiro para fazer ajustes em uniformes corporativos (calças, camisas, blazers). Trabalho contínuo.',
    shortDescription: 'Ajustes em uniformes corporativos - trabalho contínuo',
    price: 800,
    deadline: 7,
    city: 'Belo Horizonte',
    state: 'MG',
    category: 'Ajustes',
    contractType: 'CLT',
    createdAt: '2026-02-18T09:15:00Z',
    featured: false,
    urgent: false,
    company: mockCompanies[3],
    applied: true,
  },
  {
    id: '4',
    title: 'Produção de linha fitness',
    description: 'Confecção de peças fitness (leggings, tops, shorts). Experiência com malha necessária. Produção mensal de 200 peças.',
    shortDescription: 'Produção mensal de 200 peças fitness',
    price: 3500,
    deadline: 20,
    city: 'Curitiba',
    state: 'PR',
    category: 'Malharia',
    contractType: 'Freela',
    createdAt: '2026-02-17T16:45:00Z',
    featured: true,
    urgent: false,
    company: mockCompanies[0],
    applied: false,
  },
  {
    id: '5',
    title: 'Costura de camisas sob medida',
    description: 'Alfaiataria de alto padrão busca costureiro para produção de camisas masculinas sob medida. Excelente acabamento necessário.',
    shortDescription: 'Camisas masculinas sob medida - alfaiataria',
    price: 2200,
    deadline: 25,
    city: 'Porto Alegre',
    state: 'RS',
    category: 'Alfaiataria',
    contractType: 'PJ',
    createdAt: '2026-02-16T11:00:00Z',
    featured: false,
    urgent: false,
    company: mockCompanies[4],
    applied: false,
  },
  {
    id: '6',
    title: 'Reparos em roupas vintage',
    description: 'Brechó de luxo precisa de costureiro especializado em reparos delicados em peças vintage. Conhecimento em tecidos antigos é um diferencial.',
    shortDescription: 'Reparos em peças vintage de brechó',
    price: 1200,
    deadline: 10,
    city: 'São Paulo',
    state: 'SP',
    category: 'Reparos',
    contractType: 'Freela',
    createdAt: '2026-02-15T08:30:00Z',
    featured: false,
    urgent: true,
    company: mockCompanies[1],
    applied: false,
  },
  {
    id: '7',
    title: 'Customização de jaquetas jeans',
    description: 'Marca de streetwear busca costureiro para customizar jaquetas jeans com patches, bordados e aplicações. Criatividade é essencial.',
    shortDescription: 'Customização criativa de jaquetas jeans',
    price: 1800,
    deadline: 12,
    city: 'Rio de Janeiro',
    state: 'RJ',
    category: 'Customização',
    contractType: 'Freela',
    createdAt: '2026-02-14T13:20:00Z',
    featured: false,
    urgent: false,
    coinCost: 5,
    company: mockCompanies[3],
    applied: false,
  },
  {
    id: '8',
    title: 'Produção de roupas infantis',
    description: 'Confecção de roupas infantis precisa de costureiro para produção em larga escala. Experiência com modelagem infantil é desejável.',
    shortDescription: 'Produção em larga escala - roupas infantis',
    price: 4000,
    deadline: 30,
    city: 'Fortaleza',
    state: 'CE',
    category: 'Infantil',
    contractType: 'CLT',
    createdAt: '2026-02-13T10:10:00Z',
    featured: true,
    urgent: false,
    company: mockCompanies[0],
    applied: false,
  },
];

let appliedServices = new Set<string>(['3']); // IDs dos serviços que o usuário já se candidatou

// ========== API FUNCTIONS ==========

export const fetchServices = async (filters?: Partial<{
  search: string;
  category: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  contractType: string;
  sortBy: string;
}>): Promise<Service[]> => {
  // Simulando delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));

  let filtered = [...mockServices];

  // Aplicar filtros
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.title.toLowerCase().includes(search) || 
      s.description.toLowerCase().includes(search)
    );
  }

  if (filters?.category && filters.category !== 'all') {
    filtered = filtered.filter(s => s.category === filters.category);
  }

  if (filters?.city && filters.city !== 'all') {
    filtered = filtered.filter(s => s.city === filters.city);
  }

  if (filters?.contractType && filters.contractType !== 'all') {
    filtered = filtered.filter(s => s.contractType === filters.contractType);
  }

  if (filters?.minPrice !== undefined) {
    filtered = filtered.filter(s => s.price >= filters.minPrice);
  }

  if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
    filtered = filtered.filter(s => s.price <= filters.maxPrice);
  }

  // Ordenação
  if (filters?.sortBy === 'price') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filters?.sortBy === 'recent') {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Atualizar status de aplicação
  filtered = filtered.map(s => ({
    ...s,
    applied: appliedServices.has(s.id),
  }));

  return filtered;
};

export const fetchFeaturedServices = async (): Promise<Service[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const featured = mockServices
    .filter(s => s.featured)
    .map(s => ({
      ...s,
      applied: appliedServices.has(s.id),
    }));
  
  return featured;
};

export const fetchServiceById = async (id: string): Promise<Service | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const service = mockServices.find(s => s.id === id);
  if (!service) return null;
  
  return {
    ...service,
    applied: appliedServices.has(id),
  };
};

export const applyToService = async (
  serviceId: string, 
  message: string
): Promise<Application> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Simular erro se já aplicou
  if (appliedServices.has(serviceId)) {
    throw new Error('Você já se candidatou a este serviço');
  }

  appliedServices.add(serviceId);

  const application: Application = {
    id: `app-${Date.now()}`,
    serviceId,
    seamstressId: 'current-user-id',
    status: 'pending',
    message,
    createdAt: new Date().toISOString(),
  };

  return application;
};

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock de autenticação
  const mockUser: User = {
    id: 'user-123',
    name: 'Maria Silva',
    email,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    coins: 150,
    city: 'São Paulo',
    state: 'SP',
    role: 'seamstress',
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  localStorage.setItem('token', mockToken);

  return { user: mockUser, token: mockToken };
};

export const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockUser: User = {
    id: 'user-' + Date.now(),
    name,
    email,
    coins: 50, // Bônus inicial
    role: 'seamstress',
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  localStorage.setItem('token', mockToken);

  return { user: mockUser, token: mockToken };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  appliedServices = new Set(['3']); // Reset
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    id: 'user-123',
    name: 'Maria Silva',
    email: 'maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    coins: 150,
    city: 'São Paulo',
    state: 'SP',
    role: 'seamstress',
  };
};

export default api;
