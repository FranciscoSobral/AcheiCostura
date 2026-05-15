import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Inicio.css'; 

const Inicio: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="inicio-wrapper">
      <div className="grid-overlay"></div>

      <main className="stack-container">
        
        <section className="step step-1">
          <div className="abstract-shape"></div>
          <div className="content">
            <span className="tag">✨ O Coração da Moda em Pernambuco</span>
            <h1>Tecnologia que movimenta a sua <span>produção.</span></h1>
            <p>A maior plataforma B2B conectando o Agreste ao mundo. Otimize sua logística e encontre parceiros qualificados.</p>
            
            <div className="hero-stats">
              <div className="stat-item"><strong>Região Agreste</strong><span>Foco Local</span></div>
              <div className="stat-item"><strong>24h</strong><span>Match Médio</span></div>
            </div>
          </div>
        </section>

        {/* SEÇÃO ECOSSISTEMA E FILTROS */}
<section className="step step-2" id="ecossistema">
  <div className="content">
    <span className="tag">⚙️ Ecossistema Inteligente</span>
    <h2>A oficina certa, no <span>lugar certo.</span></h2>
    <div className="features-grid">
      <div className="f-card">
        <div className="card-line"></div>
        <span className="number">01</span>
        <h3>Filtro por Especialidade</h3>
        <p>Busque por tipo: Modinha, Jeans, Moda praia, Fitness, Roupa íntima, Sleepwear, Camisaria, Etc</p>
      </div>
      <div className="f-card">
        <div className="card-line"></div>
        <span className="number">02</span>
        <h3>Geolocalização</h3>
        <p>Filtre por cidades proximos a sua para reduzir o frete.</p>
      </div>
      <div className="f-card">
        <div className="card-line"></div>
        <span className="number">03</span>
        <h3>Contatos Verificados</h3>
        <p>Chega de números falsos. Acesse contatos reais validados pela nossa curadoria.</p>
      </div>
      <div className="f-card">
        <div className="card-line"></div>
        <span className="number">04</span>
        <h3>Banco de Vagas</h3>
        <p>Precisa de profissionais qualificados? Publique sua vaga e receba candidatos no dia.</p>
      </div>
    </div>
  </div>
</section>

        <section className="step step-profiles" id="solucoes">
          <div className="content">
            <span className="tag">🎯 Soluções</span>
            <h2>Feito para quem faz a <span>moda acontecer.</span></h2>
            <div className="dual-grid">
              <div className="profile-card">
                <h3>Para Confecções</h3>
                <ul>
                  <li>Facções em tempo recorde</li>
                  <li>Redução de custos</li>
                </ul>
              </div>
              <div className="profile-card highlighted">
                <h3>Para Facções</h3>
                <ul>
                  <li>Agenda cheia o ano todo</li>
                  <li>Portfólio digital</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="step step-4">
          <div className="content">
            <h2>Transforme sua produção <span>hoje.</span></h2>
                <p>Junte-se à rede de colaboração têxtil uma plataforma promissora para o seu futuro. Menos burocracia, mais costura. Faça seu cadastro gratuitamente em 2 minutos.</p>
            <div className="final-btns">
              <button className="cta-white" onClick={() => navigate('/register')}>Cadastrar Grátis</button>
              <button className="cta-dark" onClick={() => navigate('/contato')}>Falar com Consultor</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Inicio;