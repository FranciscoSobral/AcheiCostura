import React, { useState } from 'react';
import { FaCheck, FaStar, FaCoins } from 'react-icons/fa'; 
import SpeechButton from '../../components/SpeechButton';
import coinImg from '../../../assets/coins.png'; 
import PagamentosModal from '../PagamentosModal';
import './style.css';

// Interface para garantir a tipagem do produto selecionado
interface Produto {
  id: number;
  nome: string;
  preco: string;
  tipo: string;
  dias?: number | null;
}

const PlanosPage = () => {
  // --- ESTADOS PARA CONTROLAR O MODAL ---
  const [modalAberto, setModalAberto] = useState(false); //[cite: 1, 2]
  const [planoSelecionado, setPlanoSelecionado] = useState<Produto | null>(null); //[cite: 1, 2]

  // Textos para o SpeechButton[cite: 2]
  const textoPlanoMensal = "Plano Mensal. Benefícios: Desbloqueie todos os contatos por 1 mês. Navegação sem anúncios de terceiros. Ideal para projetos rápidos.";
  const textoPlanoTrimestral = "Plano Trimestral. Benefícios: Desbloqueie todos os contatos por 3 meses. Sem anúncios. Suporte prioritário. Ótimo custo-benefício.";
  const textoPlanoSemestral = "Plano Semestral. Benefícios: Desbloqueie todos os contatos por 6 meses. Sem anúncios. Suporte prioritário. Máxima economia.";
  const textoPlanoAnual = "Plano Anual. Benefícios: Acesso anual completo. Suporte Premium. Navegação sem anúncios.";
  const textoCoins = "Comprar AC Coins. Compre moedas para desbloquear facções individualmente. Sem mensalidade.";

  // --- FUNÇÃO PARA ABRIR O PAGAMENTO EM MODAL ---
  // Substitui o navigate antigo por estados internos[cite: 2]
  const handleAbrirPagamento = (nome: string, preco: string, tipo: string, id: number, dias: number | null = null) => {
    setPlanoSelecionado({
      id: id,
      nome: nome,
      preco: preco,
      tipo: tipo,
      dias: dias
    });
    setModalAberto(true);
  };

  return (
    <div className="planos-container">
      
      <div className="planos-header">
        <h1 className="titulo-principal">Nossos Planos</h1>
        <p className="subtitulo">Escolha a melhor opção para o seu negócio</p>
      </div>

      <div className="planos-grid">
        
        {/* 1. MENSAL */}
        <div className="plano-card">
          <div className="card-top-actions">
             <SpeechButton textToSpeak={textoPlanoMensal} />
          </div>
          <div className="plano-nome">Mensal</div>
          <p className="plano-desc">Ideal para projetos rápidos.</p>
          <hr />
          <ul className="lista-beneficios">
            <li><FaCheck className="icon-check" /><strong> Acesso por 1 mês</strong></li>
            <li><FaCheck className="icon-check" /><strong> 10 moedas</strong></li>
            <li className="inativo">Sem anúncios</li>
          </ul>
          <button 
            className="btn-plano btn-outline"
          >
            Assinar Agora R$ 49,90
          </button>
        </div>

        {/* 2. TRIMESTRAL */}
        <div className="plano-card">
          <div className="plano-nome">Trimestral</div>
          
          <p className="plano-desc">Ótimo custo-benefício.</p>
          <hr />
          <ul className="lista-beneficios">
            <li><FaCheck className="icon-check" /><strong>Acesso por 3 meses</strong></li>
            <li><FaCheck className="icon-check" /> <strong>12 moedas p/ mês</strong></li>
            <li><FaCheck className="icon-check" /> <strong>Moedas acumulam</strong></li>
          </ul>
          <button 
            className="btn-plano btn-outline"
          >
            Assinar Agora R$ 149,70
          </button>
        </div>

        {/* 3. SEMESTRAL */}
        <div className="plano-card">
          <div className="card-top-actions">
             <SpeechButton textToSpeak={textoPlanoSemestral} />
          </div>
          <div className="plano-nome">Semestral</div>
          <p className="plano-desc">Máxima economia.</p>
          <hr />
          <ul className="lista-beneficios">
            <li><FaCheck className="icon-check" /> <strong>Acesso por 6 meses</strong></li>
            <li><FaCheck className="icon-check" /> <strong>15 moedas p/ mês</strong></li>
          </ul>
          <button 
            className="btn-plano btn-outline"
          >
            Assinar Agora R$ 239,40
          </button>
        </div>

        {/* 4. ANUAL */}
        <div className="plano-card destaque">
          <div className="card-top-actions">
             <SpeechButton textToSpeak={textoPlanoAnual} />
          </div>
          <div className="plano-nome">Anual</div>
          <div className="badge-recomendado"><FaStar /> Melhor Custo</div>
          <p className="plano-desc">Acesso completo.</p>
          <hr />
          <ul className="lista-beneficios">
            <li><FaCheck className="icon-check" /> <strong> Acesso por 12 meses</strong></li>
            <li><FaCheck className="icon-check" /> <strong>20 moedas p/ mês</strong></li>
          </ul>
           <button 
            className="btn-plano btn-cheio"
          >
            Assinar Agora R$ 358,80
          </button>
        </div>

        {/* 5. AC COINS */}
        <div className="plano-card card-coins-style">
          <div className="card-top-actions">
             <SpeechButton textToSpeak={textoCoins} />
          </div>
          <div className="plano-nome">AC COINS</div>
          <div className="img-coins-wrapper">
            <img src={coinImg} alt="Moedas" />
          </div>
          <p className="plano-desc">Pague apenas pelo que usar.</p>
          <hr />
          <button 
            className="btn-plano btn-gold"
          >
            Comprar Moedas
          </button>
        </div>

        {/* 6. CARROSSEL (DESTAQUE) */}
        <div className="plano-card">
          <div className="badge-recomendado" style={{ backgroundColor: '#e74c3c' }}>🚀 Destaque Extra</div>
          <div className="plano-nome">Seu Anúncio</div>
          <p className="plano-desc">Topo da Home.</p>
          <hr />
          <button 
            className="btn-plano btn-cheio"
          >
            Quero Destacar
          </button>
        </div>

      </div>

    </div>
  );
};

export default PlanosPage;