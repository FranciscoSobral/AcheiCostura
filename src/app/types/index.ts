export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  deadline: number; // dias
  city: string;
  state: string;
  category: string;
  contractType: string;
  createdAt: string;
  featured: boolean;
  urgent: boolean;
  coinCost?: number; // custo em moedas para candidatura (serviços premium)
  company: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  applied?: boolean; // se o costureiro já se candidatou
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coins: number;
  city?: string;
  state?: string;
  role: 'seamstress' | 'company' | 'USER' | 'EMPRESA' | 'COUTURIER';
}

export interface Application {
  id: string;
  serviceId: string;
  seamstressId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
}

export interface SeamstressProfile extends User {
  bio: string;
  specialties: string[];
  portfolio: string[]; // URLs de imagens
  rating: number;
  completedJobs: number;
  yearsExperience: number;
}

export interface ApplicationWithSeamstress extends Application {
  seamstress: SeamstressProfile;
}

export interface FilterOptions {
  search: string;
  category: string;
  city: string;
  minPrice: number;
  maxPrice: number;
  contractType: string;
  sortBy: 'recent' | 'price' | 'nearby';
}
