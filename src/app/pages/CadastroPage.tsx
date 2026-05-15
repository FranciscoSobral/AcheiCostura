import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCadastro, CadastroProvider } from '../context/CadastroContext';
import Step1CriarConta from '../components/Step1CriarConta';
import Step2InformacoesBasicas from '../components/Step2InformacoesBasicas';
import Step3PerfilProfissional from '../components/Step3PerfilProfissional';
import logo from '@/assets/logo.png';
import { AlertCircle, Loader2 } from 'lucide-react';

const CadastroContent: React.FC = () => {
  const { currentStep, setCurrentStep, loading, error } = useCadastro();

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl shadow-green-900/5 border border-white/50 p-6 sm:p-8 relative overflow-hidden">
        
        {/* Header - Igual ao Login */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Logo Achei Costura"
            className="mx-auto h-20 w-20 p-1.5 rounded-xl mb-2 object-contain"
          />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Crie sua Conta</h1>
          <p className="text-gray-500">Junte-se à nossa plataforma de costura</p>
        </div>

        {/* Error Message - Igual ao Login */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-10 relative px-2">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full">
            <div
              className="h-full bg-[#006D5B] transition-all duration-500 ease-in-out rounded-full"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>

          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-[#006D5B] text-white shadow-md shadow-[#006D5B]/30 scale-110 ring-4 ring-white'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {step}
              </div>
              <p
                className={`text-xs mt-3 absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${
                  currentStep >= step ? 'text-[#006D5B] font-medium' : 'text-gray-500'
                }`}
              >
                {step === 1 && 'Criar Conta'}
                {step === 2 && 'Informações'}
                {step === 3 && 'Finalizar'}
              </p>
            </div>
          ))}
        </div>

        <div className="h-4"></div>

        {/* Steps Content */}
        <div className="mt-2 transition-all duration-300">
          {currentStep === 1 && <Step1CriarConta />}
          {currentStep === 2 && <Step2InformacoesBasicas onNext={handleNext} onBack={handleBack} />}
          {currentStep === 3 && <Step3PerfilProfissional onBack={handleBack} />}
        </div>

        {/* Footer - Igual ao Login */}
        {currentStep === 1 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-100 text-sm">
            <span className="text-gray-600">Já tem uma conta? </span>
            <Link to="/login" className="text-[#006D5B] hover:text-[#005a4b] font-medium hover:underline transition-colors">
              Entrar
            </Link>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl transition-all">
            <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-xl shadow-green-900/5 border border-gray-100">
              <Loader2 className="h-10 w-10 text-[#006D5B] animate-spin mb-4" />
              <p className="text-[#006D5B] font-medium">Processando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CadastroPage: React.FC = () => {
  return (
    <CadastroProvider>
      <CadastroContent />
    </CadastroProvider>
  );
};