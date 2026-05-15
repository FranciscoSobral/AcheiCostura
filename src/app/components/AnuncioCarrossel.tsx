import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AnuncioCarrossel.css';

interface CarrosselItem {
  id: string | number;
  nome: string;
  tipo: string;
  categoria: string;
  imageUrl: string;
}

interface AnuncioCarrosselProps {
  items: CarrosselItem[];
}

function AnuncioCarrossel({ items = [] }: AnuncioCarrosselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    const isLastItem = currentIndex === items.length - 1;
    const newIndex = isLastItem ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToPrevious = () => {
    const isFirstItem = currentIndex === 0;
    const newIndex = isFirstItem ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    if (items.length > 0) {
      const timer = setTimeout(goToNext, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, items]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="carrossel-container-novo">
      <button onClick={goToPrevious} className="carrossel-arrow-novo left-arrow-novo">
        ←
      </button>

      {/* O Link agora envolve apenas a área central para não pegar as setas */}
      <Link to={`/${currentItem.tipo}/${currentItem.id}`} className="carrossel-slide-novo">
        <img src={currentItem.imageUrl} alt={currentItem.nome} className="carrossel-imagem-novo" />
        <div className="carrossel-info-novo">
          <p className="carrossel-nome-novo">{currentItem.nome}</p>
          <p className="carrossel-categoria-novo">
            {currentItem.tipo.charAt(0).toUpperCase() + currentItem.tipo.slice(1)} • {currentItem.categoria}
          </p>
        </div>
      </Link>
      
      <button onClick={goToNext} className="carrossel-arrow-novo right-arrow-novo">
        →
      </button>
    </div>
  );
}

export default AnuncioCarrossel;
