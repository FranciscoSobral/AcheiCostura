import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHandshake, FaUsers, FaLightbulb, FaRocket } from 'react-icons/fa';
// AQUI: Importamos o SpeechButton2 (o verde) em vez do original
import './style.css';

const SobreNosPage = () => {
  // Texto que será lido pelo áudio
  const textoNarracao = `
    Sobre o Achei Costura.
    Conectando quem costura a quem precisa.
    Nossa História: Tudo começou com uma necessidade real. Um grande empresário do polo de confecções percebeu a dificuldade de encontrar profissionais qualificados. Ele uniu forças com uma equipe de programadores para criar esta solução.
    Nossa Missão: Democratizar o acesso às oportunidades no setor têxtil.
    Nosso Compromisso: Ser a ponte confiável entre grandes marcas e quem produz.
  `;

  return (
    <div className="sobre-container">
      
      {/* SEÇÃO HERO */}
      <section className="sobre-hero">
        <div className="hero-content">
          
          {/* BOTÃO DE ÁUDIO (Agora usa o estilo Verde/Branco do SpeechButton2) 
          <div className="audio-wrapper">
             <SpeechButton textToSpeak={textoNarracao} />
          </div>
          */}

          <h1>Conectando quem costura a quem precisa</h1>
          <p>
            O Achei Costura nasceu para revolucionar o mercado têxtil, facilitando parcerias reais e duradouras.
          </p>
        </div>
      </section>

      {/* SEÇÃO DA HISTÓRIA */}
      <section className="sobre-historia">
        <div className="historia-texto">
          <h2>Nossa História</h2>
          <p>
            Tudo começou com uma necessidade real. Um grande empresário do polo de confecções percebeu a dificuldade diária de encontrar profissionais qualificados e facções de confiança.
          </p>
          <p>
            Ele uniu forças com uma equipe de programadores apaixonados por inovação. Juntos, criamos o <strong>Achei Costura</strong>: uma solução feita por quem entende do mercado para quem vive dele.
          </p>
        </div>
        <div className="historia-cards">
          <div className="card-valor">
            <FaUsers className="icon-valor" />
            <h3>União</h3>
            <p>Tecnologia e experiência de mercado andando juntas.</p>
          </div>
          <div className="card-valor">
            <FaLightbulb className="icon-valor" />
            <h3>Inovação</h3>
            <p>Transformando a busca por facções em algo simples.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE MISSÃO VISUAL */}
      <section className="sobre-missao">
        <div className="missao-box">
          <FaRocket className="missao-icon" />
          <h2>Nossa Missão</h2>
          <p>
            Democratizar o acesso às oportunidades no setor têxtil, permitindo que costureiras, modelistas e facções de todos os tamanhos encontrem trabalho digno e empresas parceiras.
          </p>
        </div>
        <div className="missao-box">
          <FaHandshake className="missao-icon" />
          <h2>Nosso Compromisso</h2>
          <p>
            Ser a ponte confiável entre a demanda das grandes marcas e o talento de quem produz, gerando renda e crescimento para toda a região.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="sobre-cta">
        <h2>Faça parte dessa revolução</h2>
        <p>Seja você uma empresa ou um profissional, seu lugar é aqui.</p>
        <div className="cta-buttons">
          <Link to="/cadastro" className="btn-cta btn-primary">Cadastre-se Grátis</Link>
          <Link to="/contato" className="btn-cta btn-secondary">Fale Conosco</Link>
        </div>
      </section>

    </div>
  );
};

export default SobreNosPage;