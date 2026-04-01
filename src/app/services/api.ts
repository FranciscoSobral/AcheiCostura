import axios from 'axios';
import type { Service, Application, User } from '../types';

const apiBaseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const GLOBAL_REQUEST_GAP_MS = 120;
const DEFAULT_SHORT_CACHE_MS = 1200;

let lastRequestTime = 0;
let requestQueue: Promise<void> = Promise.resolve();

const inFlightRequests = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const failedRequestCooldown = new Map<string, { expiresAt: number; errorMessage: string }>();
const inFlightProfileImages = new Map<string, Promise<string | null>>();
const profileImageCache = new Map<string, { expiresAt: number; value: string | null }>();

const PROFILE_IMAGE_SUCCESS_CACHE_MS = 5 * 60 * 1000;
const PROFILE_IMAGE_ERROR_COOLDOWN_MS = 2 * 60 * 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const stableStringify = (value: unknown): string => {
  if (value === null || value === undefined) return String(value);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`)
    .join(',')}}`;
};

const buildRequestKey = (
  method: string,
  url: string,
  params?: unknown,
  extraKey?: string
) => `${method.toUpperCase()}::${url}::${stableStringify(params)}::${extraKey || ''}`;

const runWithGlobalRateLimit = async <T>(executor: () => Promise<T>): Promise<T> => {
  const run = async () => {
    const now = Date.now();
    const waitMs = Math.max(0, GLOBAL_REQUEST_GAP_MS - (now - lastRequestTime));
    if (waitMs > 0) {
      await wait(waitMs);
    }
    lastRequestTime = Date.now();
    return executor();
  };

  const queued = requestQueue.then(run, run);
  requestQueue = queued.then(
    () => undefined,
    () => undefined
  );
  return queued;
};

const cachedGet = async <T>(
  url: string,
  options: {
    params?: unknown;
    responseType?: 'json' | 'arraybuffer' | 'blob' | 'document' | 'text' | 'stream';
    cacheMs?: number;
    errorCooldownMs?: number;
    dedupe?: boolean;
    cacheKeySuffix?: string;
  } = {}
): Promise<T> => {
  const {
    params,
    responseType = 'json',
    cacheMs = DEFAULT_SHORT_CACHE_MS,
    errorCooldownMs = 0,
    dedupe = true,
    cacheKeySuffix,
  } = options;

  const key = buildRequestKey('GET', url, params, `${responseType}::${cacheKeySuffix || ''}`);
  const now = Date.now();

  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const failedCached = failedRequestCooldown.get(key);
  if (failedCached && failedCached.expiresAt > now) {
    throw new Error(failedCached.errorMessage);
  }

  if (dedupe) {
    const inFlight = inFlightRequests.get(key);
    if (inFlight) {
      return inFlight as Promise<T>;
    }
  }

  const promise = runWithGlobalRateLimit(async () => {
    const response = await api.get<T>(url, { params, responseType });
    return response.data;
  });

  inFlightRequests.set(key, promise as Promise<unknown>);

  try {
    const data = await promise;
    failedRequestCooldown.delete(key);
    if (cacheMs > 0) {
      responseCache.set(key, { expiresAt: Date.now() + cacheMs, value: data });
    }
    return data;
  } catch (error: any) {
    if (errorCooldownMs > 0) {
      failedRequestCooldown.set(key, {
        expiresAt: Date.now() + errorCooldownMs,
        errorMessage:
          error?.message || `Requisicao em cooldown apos falha para ${url}`,
      });
    }
    throw error;
  } finally {
    inFlightRequests.delete(key);
  }
};

const formatRequestData = (data: unknown) => {
  if (!data) return undefined;
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const keys: string[] = [];
    data.forEach((_, key) => keys.push(key));
    return { formDataKeys: keys };
  }
  return data;
};

const resolveRequestUrl = (config: { baseURL?: string; url?: string }) => {
  const base = config.baseURL || '';
  const path = config.url || '';
  if (base.startsWith('http')) return `${base}${path}`;
  if (base.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${base}${path}`;
  }
  return `${base}${path}`;
};

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.info('[API] Request', {
    method: config.method?.toUpperCase(),
    url: resolveRequestUrl({ baseURL: config.baseURL, url: config.url }),
    params: config.params,
    data: formatRequestData(config.data),
  });
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.info('[API] Response', {
      method: response.config.method?.toUpperCase(),
      url: resolveRequestUrl({ baseURL: response.config.baseURL, url: response.config.url }),
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API] Error', {
      method: error.config?.method?.toUpperCase(),
      url: resolveRequestUrl({ baseURL: error.config?.baseURL, url: error.config?.url }),
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

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

export interface CouturierApiDTO {
  id: string;
  name?: string;
  city?: string;
  state?: string;
  category?: string;
  ratingAverage?: number;
  rating?: number;
  verified?: boolean;
  unlocked?: boolean;
  machines?: string[] | string;
  factionType?: string[] | string;
  sewingExperienceYears?: string;
  availability?: string;
}

export interface CouturierFilters {
  search?: string;
  category?: string;
  city?: string;
  verified?: boolean;
  preferUnlockStatus?: boolean;
}

export interface UnlockedProfileDTO {
  id?: string;
  couturierId: string;
  couturierName?: string;
  unlockedAt?: string;
}

const extractErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof error?.message === 'string' && error.message.trim()) return error.message;
  return fallback;
};

export const fetchCouturiers = async (
  filters: CouturierFilters = {}
): Promise<CouturierApiDTO[]> => {
  try {
    if (filters.preferUnlockStatus) {
      try {
        return await cachedGet<CouturierApiDTO[]>('/couturiers/with-unlock-status', {
          cacheMs: 1500,
          errorCooldownMs: 5000,
        });
      } catch (unlockStatusError) {
        console.warn('Falha ao buscar unlock status, usando /couturiers como fallback.');
      }
    }

    const hasFilter =
      Boolean(filters.category) ||
      Boolean(filters.city) ||
      typeof filters.verified === 'boolean';

    if (hasFilter) {
      return await cachedGet<CouturierApiDTO[]>('/couturiers/filter', {
        params: {
          category: filters.category,
          city: filters.city,
          verified: filters.verified,
        },
        cacheMs: 1500,
        errorCooldownMs: 3000,
      });
    }

    if (filters.search) {
      return await cachedGet<CouturierApiDTO[]>('/couturiers/search', {
        params: { name: filters.search },
        cacheMs: 1500,
        errorCooldownMs: 3000,
      });
    }

    return await cachedGet<CouturierApiDTO[]>('/couturiers', {
      cacheMs: 1500,
      errorCooldownMs: 3000,
    });
  } catch (error) {
    console.error('Erro ao buscar costureiros:', error);
    throw new Error('Erro ao carregar costureiros');
  }
};

export const fetchCouturierById = async (
  id: string,
  preferUnlockStatus = false
): Promise<CouturierApiDTO> => {
  try {
    if (preferUnlockStatus) {
      try {
        const response = await cachedGet<CouturierApiDTO[]>('/couturiers/with-unlock-status', {
          cacheMs: 1500,
          errorCooldownMs: 5000,
          cacheKeySuffix: `findById:${id}`,
        });
        const found = response.find((item) => item.id === id);
        if (found) return found;
      } catch (unlockStatusError) {
        console.warn('Falha ao buscar unlock status por id, usando /couturiers/{id} como fallback.');
      }
    }

    return await cachedGet<CouturierApiDTO>(`/couturiers/${id}`, {
      cacheMs: 1500,
      errorCooldownMs: 3000,
    });
  } catch (error: any) {
    throw new Error(extractErrorMessage(error, 'Erro ao carregar perfil do costureiro'));
  }
};

export const fetchProfileImage = async (userId: string): Promise<string | null> => {
  const cacheKey = `profile-image:${userId}`;
  const now = Date.now();

  const cached = profileImageCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = inFlightProfileImages.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const requestPromise = runWithGlobalRateLimit(async () => {
    try {
      const response = await api.get<ArrayBuffer>(`/images/profile/${userId}`, {
        responseType: 'arraybuffer',
      });
      const contentType = response.headers['content-type'] || 'image/jpeg';
      const bytes = new Uint8Array(response.data);
      const chunkSize = 0x8000;
      let binary = '';

      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }

      const base64 = btoa(binary);
      const value = `data:${contentType};base64,${base64}`;
      profileImageCache.set(cacheKey, {
        expiresAt: Date.now() + PROFILE_IMAGE_SUCCESS_CACHE_MS,
        value,
      });
      return value;
    } catch {
      profileImageCache.set(cacheKey, {
        expiresAt: Date.now() + PROFILE_IMAGE_ERROR_COOLDOWN_MS,
        value: null,
      });
      return null;
    } finally {
      inFlightProfileImages.delete(cacheKey);
    }
  });

  inFlightProfileImages.set(cacheKey, requestPromise);
  return requestPromise;
};

export const unlockCouturierProfile = async (enterpriseId: string, couturierId: string): Promise<void> => {
  try {
    await api.post(`/enterprises/${enterpriseId}/coins/unlock`, {
      couturierId,
    });
  } catch (error: any) {
    console.error('Erro ao desbloquear perfil:', error);
    const message = extractErrorMessage(error, 'Erro ao desbloquear perfil');
    throw new Error(message);
  }
};

export const getEnterpriseCoinsBalance = async (enterpriseId: string): Promise<number> => {
  try {
    const data = await cachedGet<number>(`/enterprises/${enterpriseId}/coins/balance`, {
      cacheMs: 500,
      errorCooldownMs: 2500,
    });
    return Number(data ?? 0);
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Erro ao consultar saldo');
    throw new Error(message);
  }
};

export const getEnterpriseUnlockedProfiles = async (
  enterpriseId: string
): Promise<UnlockedProfileDTO[]> => {
  try {
    const data = await cachedGet<UnlockedProfileDTO[]>(
      `/enterprises/${enterpriseId}/coins/unlocked-profiles`,
      {
        cacheMs: 1500,
        errorCooldownMs: 3000,
      }
    );
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Erro ao consultar perfis desbloqueados');
    throw new Error(message);
  }
};

export const purchaseEnterpriseCoins = async (enterpriseId: string, amount: number): Promise<void> => {
  try {
    await api.post(`/enterprises/${enterpriseId}/coins/purchase`, { amount });
  } catch (error: any) {
    const message = extractErrorMessage(error, 'Erro ao comprar moedas');
    throw new Error(message);
  }
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

const loginMock = async (email: string, password: string): Promise<{ user: User; token: string }> => {
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

const registerMock = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
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

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data?.token;

    if (!token) {
      throw new Error('Token não retornado pelo servidor');
    }

    localStorage.setItem('token', token);

    const userResponse = await api.get('/users/me');
    const userData = userResponse.data;

    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      coins: userData.coins ?? 0,
      city: userData.city,
      state: userData.state,
      role: userData.role,
      avatar: userData.avatar,
    };

    return { user, token };
  } catch (error: any) {
    const message = error.response?.data || error.response?.data?.message || 'Erro ao fazer login';
    throw new Error(message);
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: 'COUTURIER' | 'EMPRESA'
): Promise<{ user: User; token: string }> => {
  try {
    await api.post('/auth/register', { name, email, password, role });
    return await login(email, password);
  } catch (error: any) {
    const message = error.response?.data || error.response?.data?.message || 'Erro ao criar conta';
    throw new Error(message);
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  appliedServices = new Set(['3']); // Reset
};

export const getCurrentUser = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await api.get('/users/me');
    const userData = response.data;

    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      coins: userData.coins ?? 0,
      city: userData.city,
      state: userData.state,
      role: userData.role,
      avatar: userData.avatar,
    };
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return null;
  }
};

export const updateUser = async (userId: string, payload: Record<string, any>) => {
  try {
    const response = await api.put(`/users/${userId}`, payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data || error.response?.data?.message || 'Erro ao atualizar usuário';
    throw new Error(message);
  }
};

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api.post('/images/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data || error.response?.data?.message || 'Erro ao enviar imagem de perfil';
    throw new Error(message);
  }
};

export const uploadOtherImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  try {
    const response = await api.post('/images/others', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data || error.response?.data?.message || 'Erro ao enviar imagens';
    throw new Error(message);
  }
};

const getCurrentUserMock = async (): Promise<User | null> => {
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
