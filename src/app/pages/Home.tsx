import React, { useState, useEffect } from 'react';
import type { Service } from '../types';
import { fetchServices } from '../services/api';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { ServiceCard } from '../components/ServiceCard';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, Briefcase } from 'lucide-react';

export const Home = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    city: 'all',
    minPrice: 0,
    maxPrice: 0,
    contractType: 'all',
    sortBy: 'recent',
  });

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchServices({
        search: searchQuery,
        category: filters.category !== 'all' ? filters.category : undefined,
        city: filters.city !== 'all' ? filters.city : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice > 0 ? filters.maxPrice : undefined,
        contractType: filters.contractType !== 'all' ? filters.contractType : undefined,
        sortBy: filters.sortBy,
      });
      setServices(data);
    } catch (err) {
      setError('Erro ao carregar serviços. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleSearch = () => {
    loadServices();
  };

  const handleApplyFilters = () => {
    loadServices();
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      city: 'all',
      minPrice: 0,
      maxPrice: 0,
      contractType: 'all',
      sortBy: 'recent',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#004D40] via-[#006D5B] to-[#009688] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Encontre o Serviço Perfeito
            </h1>
            <p className="text-lg text-purple-100">
              Milhares de empresas procurando por costureiros talentosos como você
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
              />
            </div>
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Featured Carousel */}
        <FeaturedCarousel />

        {/* All Services */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-semibold">Todos os Serviços</h2>
            </div>
            <p className="text-gray-600">
              {services.length} {services.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-80 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Services Grid */}
          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && services.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Tente ajustar seus filtros ou fazer uma nova busca
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
