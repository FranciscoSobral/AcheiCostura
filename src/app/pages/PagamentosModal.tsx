import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaQrcode, FaCreditCard, FaBarcode, FaCheckCircle, FaCopy } from 'react-icons/fa';
import { gerarPagamentoPix } from "../data/api";

// --- INTERFACES ---
interface Produto {
  id: number;
  nome: string;
  preco: string;
  tipo: string;
}

interface OpcaoParcelamento {
  qtd: number;
  texto: string;
}

interface PixResponse {
  success: boolean;
  pixData?: {
    qrCodeBase64: string;
    codigoCopiaECola: string;
  };
}

// Definição das Props do Modal[cite: 1]
interface PagamentosModalProps {
  produto: Produto;
  onClose: () => void;
}

// --- LÓGICA DE APOIO ---
const converterPrecoParaNumero = (preco: string): number => {
  const valorLimpo = preco.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
  return parseFloat(valorLimpo) || 0;
};

const calcularParcelamento = (preco: string): OpcaoParcelamento[] => {
  const valorNumerico = converterPrecoParaNumero(preco);
  const opcoes: OpcaoParcelamento[] = [];
  for (let i = 1; i <= 12; i++) {
    const valorParcela = valorNumerico / i;
    if (valorParcela < 5 && i > 1) break;
    opcoes.push({
      qtd: i,
      texto: `${i}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${i === 1 ? '(à vista)' : 'sem juros'}`
    });
  }
  return opcoes;
};

const PagamentosModal: React.FC<PagamentosModalProps> = ({ produto, onClose }) => {
  const navigate = useNavigate();
  const [metodo, setMetodo] = useState<'pix' | 'cartao' | 'boleto'>('pix');
  const [loading, setLoading] = useState(false);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; copiaECola: string } | null>(null);
  const [opcoesParcelamento, setOpcoesParcelamento] = useState<OpcaoParcelamento[]>([]);

  const [dadosCartao, setDadosCartao] = useState({
    numero: '', validade: '', cvv: '', nome: '', parcelas: 1
  });

  useEffect(() => {
    setOpcoesParcelamento(calcularParcelamento(produto.preco));
    // Bloquear scroll do fundo quando o modal estiver aberto[cite: 1]
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [produto.preco]);

  const handleGerarPix = async () => {
    setLoading(true);
    try {
      const response: PixResponse = await gerarPagamentoPix({ 
        planoId: produto.id, 
        valor: converterPrecoParaNumero(produto.preco) 
      });
      if (response.success && response.pixData) {
        setPixData({ qrCode: response.pixData.qrCodeBase64, copiaECola: response.pixData.codigoCopiaECola });
      }
    } catch (err) {
      alert("Erro ao processar PIX.");
    } finally { setLoading(false); }
  };

  const handleFinalizarCartao = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMostrarModalSucesso(true);
    }, 2000);
  };

  return (
    /* Overlay do Modal - Fixo e por cima de tudo[cite: 1] */
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      
      {/* Card do Modal[cite: 1] */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 relative">
        
        {/* Header do Pagamento[cite: 1] */}
        <div className="bg-[#006D5B] p-6 text-white text-center relative">
          <button 
            onClick={onClose} 
            className="absolute left-4 top-7 p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <FaArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold">Pagamento Seguro</h2>
          <div className="mt-4 flex justify-between items-center bg-black/10 p-3 rounded-xl border border-white/10">
            <span className="text-sm opacity-90">{produto.nome}</span>
            <span className="text-xl font-black text-amber-400">{produto.preco}</span>
          </div>
        </div>

        {/* Abas de Seleção[cite: 1] */}
        <div className="flex bg-gray-50 border-b border-gray-100">
          {[
            { id: 'pix', icon: FaQrcode, label: 'PIX' },
            { id: 'cartao', icon: FaCreditCard, label: 'Cartão' },
            { id: 'boleto', icon: FaBarcode, label: 'Boleto' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMetodo(tab.id as any)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${
                metodo === tab.id 
                ? 'border-[#006D5B] text-[#006D5B] bg-white font-bold' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-[10px] uppercase font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico[cite: 1] */}
        <div className="p-6">
          {metodo === 'pix' && (
            <div className="space-y-4">
              {!pixData ? (
                <button onClick={handleGerarPix} disabled={loading} className="w-full bg-[#006D5B] text-white py-4 rounded-xl font-bold hover:bg-[#005a4b] transition-all">
                  {loading ? "Gerando..." : "Gerar QR Code PIX"}
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <img src={`data:image/png;base64,${pixData.qrCode}`} className="w-44 h-44 mx-auto border rounded-xl p-2" alt="QR" />
                  <div className="flex gap-2">
                    <input readOnly value={pixData.copiaECola} className="flex-1 bg-gray-50 border p-2 text-xs rounded-lg outline-none" />
                    <button onClick={() => { navigator.clipboard.writeText(pixData.copiaECola); alert("Copiado!"); }} className="bg-gray-100 p-2 rounded-lg"><FaCopy className="text-[#006D5B]" /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {metodo === 'cartao' && (
            <form onSubmit={handleFinalizarCartao} className="space-y-4">
              <input placeholder="Número do Cartão" className="w-full border p-3 rounded-xl outline-none" required />
              <div className="flex gap-4">
                <input placeholder="MM/AA" className="w-full border p-3 rounded-xl outline-none" required />
                <input placeholder="CVV" className="w-full border p-3 rounded-xl outline-none" required />
              </div>
              <select className="w-full border p-3 rounded-xl bg-white outline-none">
                {opcoesParcelamento.map(op => <option key={op.qtd} value={op.qtd}>{op.texto}</option>)}
              </select>
              <button disabled={loading} className="w-full bg-[#006D5B] text-white py-4 rounded-xl font-bold hover:bg-[#005a4b]">
                {loading ? "Processando..." : "Finalizar Compra"}
              </button>
            </form>
          )}

          {metodo === 'boleto' && (
            <div className="text-center space-y-4">
              <p className="text-xs text-gray-500">O boleto leva até 3 dias úteis para compensar.</p>
              <button onClick={() => setMostrarModalSucesso(true)} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold transition-all">
                Gerar Boleto Bancário
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mini Modal de Sucesso Interno[cite: 1] */}
      {mostrarModalSucesso && (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center z-[110]">
          <FaCheckCircle size={60} className="text-emerald-500 mb-4" />
          <h3 className="text-2xl font-bold">Pedido Recebido!</h3>
          <p className="text-gray-500 mt-2">Seu plano será ativado após a confirmação.</p>
          <button onClick={() => { onClose(); navigate('/'); }} className="mt-6 w-full bg-[#006D5B] text-white py-3 rounded-xl font-bold">Ir para Início</button>
        </div>
      )}
    </div>
  );
};

// Exportação necessária para o arquivo de Planos[cite: 1]
export default PagamentosModal;