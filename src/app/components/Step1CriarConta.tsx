import React, { useState } from 'react';
import { useCadastro } from '../context/CadastroContext';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../services/api';
import SpeechButton from './SpeechButton';

const Step1CriarConta: React.FC = () => {
  const {
    setCurrentStep,
    userType,
    setUserType,
    step1Data,
    setStep1Data,
    setUserId,
    setLoading,
    setError,
  } = useCadastro();

  const { login } = useAuth();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStep1Data((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!step1Data.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!step1Data.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1Data.email)) {
      errors.email = 'Email inválido';
    }

    if (!step1Data.password) {
      errors.password = 'Senha é obrigatória';
    } else if (step1Data.password.length < 8) {
      errors.password = 'Senha deve ter no mínimo 8 caracteres';
    }

    if (!step1Data.confirmPassword) {
      errors.confirmPassword = 'Confirme sua senha';
    } else if (step1Data.password !== step1Data.confirmPassword) {
      errors.confirmPassword = 'As senhas não conferem';
    }

    if (!userType) {
      errors.userType = 'Selecione o tipo de conta';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (!userType) {
        throw new Error('Selecione o tipo de conta');
      }

      const { user, token } = await registerApi(
        step1Data.name,
        step1Data.email,
        step1Data.password,
        userType
      );

      login(user, token);
      setUserId(user.id);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar conta. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Criar Conta</h2>

      <div className="user-type-selector mb-6">
        <button
          type="button"
          className={`type-button ${
            userType === 'COUTURIER'
              ? 'bg-[#006D5B] text-white border-[#006D5B] shadow-md shadow-[#006D5B]/20'
              : 'bg-white text-gray-700 border-gray-300'
          } border-2 rounded-lg px-6 py-4 flex-1 transition-all hover:border-[#006D5B]`}
          onClick={() => {
            setUserType('COUTURIER');
            setFormErrors((prev) => ({ ...prev, userType: '' }));
          }}
        >
          <span className="text-3xl mb-2 block">👕</span>
          <span className="font-medium">Sou Prestador de Serviços</span>
        </button>
        <button
          type="button"
          className={`type-button ${
            userType === 'EMPRESA'
              ? 'bg-[#006D5B]-600 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300'
          } border-2 rounded-lg px-6 py-4 flex-1 transition-all hover:border-[#006D5B]`}
          onClick={() => {
            setUserType('EMPRESA');
            setFormErrors((prev) => ({ ...prev, userType: '' }));
          }}
        >
          <span className="text-3xl mb-2 block">🏢</span>
          <span className="font-medium">Procuro Serviços</span>
        </button>
      </div>
      {formErrors.userType && (
        <span className="error-text text-red-500 text-sm block mb-4">
          {formErrors.userType}
        </span>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <div className="form-label-container flex items-center justify-between mb-2">
            <label htmlFor="name" className="font-medium text-gray-700">
              Nome Completo
            </label>
            <SpeechButton textToSpeak="Nome Completo" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={step1Data.name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B] transition-shadow ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite seu nome completo"
          />
          {formErrors.name && (
            <span className="error-text text-red-500 text-sm">{formErrors.name}</span>
          )}
        </div>

        <div className="form-group">
          <div className="form-label-container flex items-center justify-between mb-2">
            <label htmlFor="email" className="font-medium text-gray-700">
              Email
            </label>
            <SpeechButton textToSpeak="Email" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={step1Data.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B] transition-shadow ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
          />
          {formErrors.email && (
            <span className="error-text text-red-500 text-sm">{formErrors.email}</span>
          )}
        </div>

        <div className="form-group">
          <div className="form-label-container flex items-center justify-between mb-2">
            <label htmlFor="password" className="font-medium text-gray-700">
              Senha
            </label>
            <SpeechButton textToSpeak="Senha" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={step1Data.password}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B] transition-shadow ${
              formErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mínimo 8 caracteres"
          />
          {formErrors.password && (
            <span className="error-text text-red-500 text-sm">{formErrors.password}</span>
          )}
        </div>

        <div className="form-group">
          <div className="form-label-container flex items-center justify-between mb-2">
            <label htmlFor="confirmPassword" className="font-medium text-gray-700">
              Confirmar Senha
            </label>
            <SpeechButton textToSpeak="Confirmar Senha" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={step1Data.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B] transition-shadow ${
              formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Digite a senha novamente"
          />
          {formErrors.confirmPassword && (
            <span className="error-text text-red-500 text-sm">
              {formErrors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn-next w-full bg-[#006D5B] hover:bg-[#005a4b] text-white py-3 rounded-lg font-medium transition-colors shadow-md shadow-[#006D5B]/20"
        >
          Criar Conta e Continuar
        </button>
      </form>
    </div>
  );
};

export default Step1CriarConta;