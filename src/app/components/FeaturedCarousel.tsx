import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import type { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { fetchFeaturedServices } from '../services/api';
import { Skeleton } from './ui/skeleton';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Importamos apenas o CSS estrutural, removemos o slick-theme.css para evitar o bug
import 'slick-carousel/slick/slick.css';

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md border border-gray-100 rounded-full p-2 hover:bg-gray-50 transition-all group"
      aria-label="Próximo"
    >
      <ChevronRight className="w-6 h-6 text-[#006D5B] group-hover:scale-110 transition-transform" />
    </button>
  );
};

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-md border border-gray-100 rounded-full p-2 hover:bg-gray-50 transition-all group"
      aria-label="Anterior"
    >
      <ChevronLeft className="w-6 h-6 text-[#006D5B] group-hover:scale-110 transition-transform" />
    </button>
  );
};

export const FeaturedCarousel = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        const data = await fetchFeaturedServices();
        setServices(data);
      } catch (error) {
        console.error('Erro ao carregar serviços em destaque:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedServices();
  }, []);

  const settings = {
    dots: true,
    infinite: services.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    // Estilização customizada das bolinhas (dots) para evitar o visual "não personalizado"
    appendDots: (dots: any) => (
      <div className="mt-8">
        <ul className="flex justify-center gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: (i: number) => (
      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-[#006D5B] transition-colors" />
    ),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          infinite: services.length > 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          // Garante que mostre apenas 1 no celular
          slidesToShow: 1, 
          slidesToScroll: 1,
          infinite: services.length > 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          <h2 className="text-2xl font-semibold">Serviços em Destaque</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <div className="space-y-6 relative group">
      <div className="flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl font-semibold">Serviços em Destaque</h2>
      </div>

      <div className="px-2"> {/* Reduzi o padding lateral para as setas flutuarem melhor */}
        <Slider {...settings} className="featured-slider">
          {services.map((service) => (
            // A classe h-full garante que o container do slide ocupe toda a altura
            <div key={service.id} className="px-3 py-4 h-full">
              <ServiceCard service={service} />
            </div>
          ))}
        </Slider>
      </div>

      {/* CSS Inline atualizado para corrigir a altura e largura dos slides */}
      <style>{`
        /* Garante que todos os slides tenham a mesma altura */
        .featured-slider .slick-track {
          display: flex !important;
        }
        .featured-slider .slick-slide {
          height: auto;
        }
        /* Faz a div interna que envolve o card preencher o slide */
        .featured-slider .slick-slide > div {
          height: 100%;
        }
        
        .featured-slider .slick-dots li {
          width: auto;
          height: auto;
        }
        .featured-slider .slick-dots li.slick-active div {
          background-color: #006D5B;
          width: 24px; /* Efeito de pílula na bolinha ativa */
        }
      `}</style>
    </div>
  );
};