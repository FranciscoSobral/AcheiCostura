import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Service } from '../types';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Coins,
  Building2,
  BadgeCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const navigate = useNavigate();

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return `${days} dias atrás`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden flex flex-col">

        {/* Badges de Status - Ficam no topo direito */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
          {service.urgent && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
              Urgente
            </Badge>
          )}
          {service.featured && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] px-2 py-0.5">
              Destaque
            </Badge>
          )}
          {service.applied && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Enviada
            </Badge>
          )}
        </div>

        {/* Padding reduzido (p-4 ao invés de pt-6) para o card ficar mais compacto */}
        <CardContent className="p-4 flex-1 flex flex-col">

          {/* Empresa - Avatar menor (w-8 h-8) e margem reduzida */}
          <div className="flex items-center gap-2 mb-3 pr-24">
            {service.company.logo ? (
              <img
                src={service.company.logo}
                alt={service.company.name}
                className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {service.company.name}
                </p>
                {service.company.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-gray-500">{getDaysAgo(service.createdAt)}</p>
            </div>
          </div>

          {/* Título mais contido (text-base) e Descrição */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
            {service.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.shortDescription}
          </p>

          {/* Categoria */}
          <div className="mb-3">
            <Badge variant="outline" className="text-xs text-gray-600 bg-gray-50/50">
              {service.category}
            </Badge>
          </div>

          {/* Informações Agrupadas (A caixinha de organização no final) */}
          <div className="mt-auto pt-4 space-y-2.5">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#006D5B]" />
                <span className="text-base font-bold text-gray-900">
                  R$ {service.price.toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{service.deadline} dias</span>
              </div>
            </div>

            {/* Linha de Localização com separador sutil */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 text-gray-500">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
              <span className="text-xs truncate">
                {service.city}, {service.state}
              </span>
            </div>
          </div>

        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 mt-auto">
          <Button
            className="w-full bg-[#006D5B] text-white font-medium shadow-sm transition-all duration-300 hover:bg-[#005a4b] h-9 text-sm"
            onClick={() => navigate(`/service/${service.id}`)}
            variant={service.applied ? "secondary" : "default"}
          >
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
