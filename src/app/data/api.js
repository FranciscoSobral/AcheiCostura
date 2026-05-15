/**
 * api.js - Serviços de integração com backend
 * Funções para gerenciar serviços, candidaturas e autenticação
 * 
 * USO:
 * import { getServicos, candidatarServico } from './data/api';
 */

import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// SERVIÇOS / JOBS
// ========================================

/**
 * Buscar lista de serviços com filtros opcionais
 * @param {Object} filtros - Filtros de busca
 * @param {string} filtros.categoria - Categoria do serviço
 * @param {string} filtros.cidade - Cidade do serviço
 * @param {string} filtros.ordenar - Ordenação (recentes, valor, prazo)
 * @param {string} filtros.busca - Termo de busca
 * @returns {Promise<Array>} Lista de serviços
 */
export const getServicos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filtros.categoria && filtros.categoria !== 'all') {
      params.append('categoria', filtros.categoria);
    }
    if (filtros.cidade && filtros.cidade !== 'all') {
      params.append('cidade', filtros.cidade);
    }
    if (filtros.ordenar) {
      params.append('ordenar', filtros.ordenar);
    }
    if (filtros.busca) {
      params.append('busca', filtros.busca);
    }
    if (filtros.contratoTipo && filtros.contratoTipo !== 'all') {
      params.append('tipoContrato', filtros.contratoTipo);
    }

    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    throw new Error(error.response?.data?.message || 'Erro ao carregar serviços');
  }
};

/**
 * Buscar serviços em destaque (para carrossel)
 * @returns {Promise<Array>} Lista de serviços em destaque
 */
export const getServicosDestaque = async () => {
  try {
    const response = await api.get('/jobs/destaque');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar serviços em destaque:', error);
    throw new Error('Erro ao carregar destaques');
  }
};

/**
 * Buscar detalhes de um serviço específico
 * @param {string} jobId - ID do serviço
 * @returns {Promise<Object>} Dados completos do serviço
 */
export const getServicoById = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    throw new Error('Serviço não encontrado');
  }
};

/**
 * Candidatar-se a um serviço
 * @param {string} jobId - ID do serviço
 * @param {string} mensagem - Mensagem de apresentação (opcional)
 * @returns {Promise<Object>} Dados da candidatura criada
 * 
 * NOTA: Se o serviço exigir moedas, elas serão debitadas automaticamente
 * O backend deve retornar o novo saldo no response
 */
export const candidatarServico = async (jobId, mensagem = '') => {
  try {
    const response = await api.post(`/jobs/${jobId}/candidatar`, {
      mensagem,
    });
    
    // Atualizar saldo de moedas no localStorage se retornado
    if (response.data.novoSaldo !== undefined) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.coins = response.data.novoSaldo;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao candidatar:', error);
    
    // Mensagens de erro específicas
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Você já se candidatou a este serviço');
    }
    if (error.response?.status === 402) {
      throw new Error('Moedas insuficientes para se candidatar');
    }
    
    throw new Error(error.response?.data?.message || 'Erro ao enviar candidatura');
  }
};

/**
 * Cancelar candidatura a um serviço
 * @param {string} jobId - ID do serviço
 * @returns {Promise<Object>} Confirmação do cancelamento
 */
export const cancelarCandidatura = async (jobId) => {
  try {
    const response = await api.delete(`/jobs/${jobId}/candidatura`);
    return response.data;
  } catch (error) {
    console.error('Erro ao cancelar candidatura:', error);
    throw new Error('Erro ao cancelar candidatura');
  }
};

// ========================================
// CANDIDATURAS DO USUÁRIO
// ========================================

/**
 * Buscar todas as candidaturas do usuário logado
 * @returns {Promise<Array>} Lista de candidaturas
 */
export const getMinhasCandidaturas = async () => {
  try {
    const response = await api.get('/candidaturas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    throw new Error('Erro ao carregar suas candidaturas');
  }
};

// ========================================
// CATEGORIAS E METADADOS
// ========================================

/**
 * Buscar lista de categorias disponíveis
 * @returns {Promise<Array>} Lista de categorias
 */
export const getCategorias = async () => {
  try {
    const response = await api.get('/categorias');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    // Retornar categorias padrão em caso de erro
    return [
      'Moda Praia',
      'Bordado',
      'Ajustes',
      'Malharia',
      'Alfaiataria',
      'Reparos',
      'Customização',
      'Infantil',
    ];
  }
};

/**
 * Buscar lista de cidades com serviços disponíveis
 * @returns {Promise<Array>} Lista de cidades
 */
export const getCidadesDisponiveis = async () => {
  try {
    const response = await api.get('/cidades');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

// ========================================
// AUTENTICAÇÃO
// ========================================

/**
 * Fazer login
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<Object>} Dados do usuário e token
 */
export const login = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    
    // Salvar token e dados do usuário
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw new Error(error.response?.data?.message || 'Erro ao fazer login');
  }
};

/**
 * Fazer cadastro
 * @param {Object} dados - Dados do novo usuário
 * @returns {Promise<Object>} Dados do usuário e token
 */
export const cadastrar = async (dados) => {
  try {
    const response = await api.post('/auth/cadastrar', dados);
    
    // Salvar token e dados do usuário
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    throw new Error(error.response?.data?.message || 'Erro ao criar conta');
  }
};

/**
 * Fazer logout
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

/**
 * Buscar dados do usuário atual
 * @returns {Promise<Object>} Dados do usuário
 */
export const getUsuarioAtual = async () => {
  try {
    const response = await api.get('/auth/me');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
};

// ========================================
// MOEDAS
// ========================================

/**
 * Comprar moedas
 * @param {number} quantidade - Quantidade de moedas a comprar
 * @param {string} metodoPagamento - Método de pagamento
 * @returns {Promise<Object>} Dados da transação
 */
export const comprarMoedas = async (quantidade, metodoPagamento) => {
  try {
    const response = await api.post('/moedas/comprar', {
      quantidade,
      metodoPagamento,
    });
    
    // Atualizar saldo local
    if (response.data.novoSaldo !== undefined) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.coins = response.data.novoSaldo;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao comprar moedas:', error);
    throw new Error('Erro ao processar compra de moedas');
  }
};

/**
 * Buscar histórico de transações de moedas
 * @returns {Promise<Array>} Lista de transações
 */
export const getHistoricoMoedas = async () => {
  try {
    const response = await api.get('/moedas/historico');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
};

// ========================================
// ESTATÍSTICAS (Dashboard)
// ========================================

/**
 * Buscar estatísticas do costureiro
 * @returns {Promise<Object>} Estatísticas
 */
export const getEstatisticas = async () => {
  try {
    const response = await api.get('/estatisticas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return {
      candidaturasEnviadas: 0,
      candidaturasAceitas: 0,
      valorTotal: 0,
      avaliacaoMedia: 0,
    };
  }
};
// Exemplo de como deve estar no seu arquivo api.js
export const gerarPagamentoPix = async (dados) => {
  try {
    const response = await api.post('/pix/gerar', dados);
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    throw error;
  }
};
// Exportar instância do axios para uso customizado
export default api;

