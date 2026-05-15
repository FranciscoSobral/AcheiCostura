import React, { useState } from 'react';
import { useCadastro } from '../context/CadastroContext';
import { updateUser } from '../services/api';
import SpeechButton from './SpeechButton';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

const Step2InformacoesBasicas: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const { userType, userId, step2Data, setStep2Data, setLoading, setError } = useCadastro();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const estados = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  const couturierCategories = [
    { value: '', label: 'Selecione uma categoria' },
    { value: 'COSTUREIRA', label: 'Costureira' },
    { value: 'BORDADEIRA', label: 'Bordadeira' },
    { value: 'CORTE', label: 'Corte' },
    { value: 'ACABAMENTO', label: 'Acabamento' },
    { value: 'ESTAMPARIA', label: 'Estamparia' },
    { value: 'LAVANDERIA', label: 'Lavanderia' },
    { value: 'MODELISTA', label: 'Modelista' },
  ];

  const experienceOptions = [
    { value: '', label: 'Selecione' },
    { value: '0-2', label: 'De 0 a 2 anos' },
    { value: '2-5', label: 'De 2 a 5 anos' },
    { value: '5-10', label: 'De 5 a 10 anos' },
    { value: '10+', label: 'Mais de 10 anos' },
  ];

  const teamSizeOptions = [
    { value: '', label: 'Selecione' },
    { value: 'alone', label: 'Trabalho sozinho(a)' },
    { value: '2', label: '2 costureiros' },
    { value: '3-5', label: 'De 3 a 5 costureiros' },
    { value: '6-10', label: 'De 6 a 10 costureiros' },
    { value: '10+', label: '10 ou mais costureiros' },
  ];

  const availabilityOptions = [
    { value: '', label: 'Selecione' },
    { value: 'MORNING_AFTERNOON', label: 'Geral (Manhã e Tarde)' },
    { value: 'MORNING', label: 'Manhã' },
    { value: 'AFTERNOON', label: 'Tarde' },
    { value: 'WEEKENDS', label: 'Apenas Finais de semana' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStep2Data((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (userType === 'COUTURIER' && !step2Data.category) {
      errors.category = 'Categoria é obrigatória';
    }
    if (!step2Data.city.trim()) errors.city = 'Cidade é obrigatória';
    if (!step2Data.state) errors.state = 'Estado é obrigatório';

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
        throw new Error('Tipo de conta nÃ£o informado.');
      }
      if (!step2Data.city || !step2Data.state) {
        throw new Error('Preencha cidade e estado.');
      }

      if (!userId) {
        throw new Error('UsuÃ¡rio nÃ£o identificado. Refazer cadastro.');
      }

      await updateUser(userId, {
        category: step2Data.category || undefined,
        city: step2Data.city,
        state: step2Data.state,
        country: step2Data.country || undefined,
        zipCode: step2Data.zipCode || undefined,
        street: step2Data.street || undefined,
        sewingExperienceYears: step2Data.sewingExperienceYears || undefined,
        teamSize: step2Data.teamSize || undefined,
        availability: step2Data.availability || undefined,
        specialty: step2Data.specialty || undefined,
        machines: step2Data.machines || undefined,
        factionType: step2Data.factionType || undefined,
      });

      onNext();
    } catch (err: any) {
      setError('Erro ao salvar informações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Informações Básicas e Perfil Profissional
      </h2>
      <p className="step-description text-gray-600 mb-6">
        Preencha seus dados de localização e perfil profissional
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {userType === 'COUTURIER' && (
          <div className="form-group">
            <div className="form-label-container flex items-center justify-between mb-2">
              <label htmlFor="category" className="font-medium text-gray-700">
                Categoria Principal *
              </label>
              <SpeechButton textToSpeak="Categoria Principal" />
            </div>
            <select
              id="category"
              name="category"
              value={step2Data.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                formErrors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {couturierCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <span className="error-text text-red-500 text-sm">{formErrors.category}</span>
            )}
          </div>
        )}

        {/* Seção Localização */}
        <div className="form-section bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Localização</h3>
          <div className="space-y-4">
            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="city" className="font-medium text-gray-700">
                  Cidade *
                </label>
                <SpeechButton textToSpeak="Cidade" />
              </div>
              <input
                type="text"
                id="city"
                name="city"
                value={step2Data.city}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  formErrors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite sua cidade"
              />
              {formErrors.city && (
                <span className="error-text text-red-500 text-sm">{formErrors.city}</span>
              )}
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="state" className="font-medium text-gray-700">
                  Estado *
                </label>
                <SpeechButton textToSpeak="Estado" />
              </div>
              <select
                id="state"
                name="state"
                value={step2Data.state}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  formErrors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um estado</option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              {formErrors.state && (
                <span className="error-text text-red-500 text-sm">{formErrors.state}</span>
              )}
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="country" className="font-medium text-gray-700">
                  País
                </label>
                <SpeechButton textToSpeak="País" />
              </div>
              <input
                type="text"
                id="country"
                name="country"
                value={step2Data.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brasil"
              />
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="zipCode" className="font-medium text-gray-700">
                  CEP
                </label>
                <SpeechButton textToSpeak="CEP" />
              </div>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={step2Data.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="00000-000"
              />
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="street" className="font-medium text-gray-700">
                  Rua
                </label>
                <SpeechButton textToSpeak="Rua" />
              </div>
              <input
                type="text"
                id="street"
                name="street"
                value={step2Data.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Rua, número, complemento"
              />
            </div>
          </div>
        </div>

        {/* Seção Perfil Profissional */}
        <div className="form-section bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Perfil Profissional</h3>
          <div className="space-y-4">
            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="sewingExperienceYears" className="font-medium text-gray-700">
                  Experiência em costura
                </label>
                <SpeechButton textToSpeak="Experiência em costura" />
              </div>
              <select
                id="sewingExperienceYears"
                name="sewingExperienceYears"
                value={step2Data.sewingExperienceYears}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {experienceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="teamSize" className="font-medium text-gray-700">
                  Tamanho da equipe
                </label>
                <SpeechButton textToSpeak="Tamanho da equipe" />
              </div>
              <select
                id="teamSize"
                name="teamSize"
                value={step2Data.teamSize}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {teamSizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="availability" className="font-medium text-gray-700">
                  Disponibilidade
                </label>
                <SpeechButton textToSpeak="Disponibilidade" />
              </div>
              <select
                id="availability"
                name="availability"
                value={step2Data.availability}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {availabilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="specialty" className="font-medium text-gray-700">
                  Especialidade
                </label>
                <SpeechButton textToSpeak="Especialidade" />
              </div>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={step2Data.specialty}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex.: Malhas, modinha, bonés"
              />
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="machines" className="font-medium text-gray-700">
                  Máquinas
                </label>
                <SpeechButton textToSpeak="Máquinas" />
              </div>
              <input
                type="text"
                id="machines"
                name="machines"
                value={step2Data.machines}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex.: Reta, Overloque, ponto conjugado"
              />
            </div>

            <div className="form-group">
              <div className="form-label-container flex items-center justify-between mb-2">
                <label htmlFor="factionType" className="font-medium text-gray-700">
                  Tipo de facção
                </label>
                <SpeechButton textToSpeak="Tipo de facção" />
              </div>
              <input
                type="text"
                id="factionType"
                name="factionType"
                value={step2Data.factionType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ex.: Lavanderia, Malharia, Corte e Costura"
              />
            </div>
          </div>
        </div>

        <div className="form-navigation flex gap-4">
          <button
            type="button"
            className="btn-back flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            onClick={onBack}
          >
            Voltar
          </button>
          <button
            type="submit"
            className="btn-next flex-1  bg-[#006D5B] text-white py-3 rounded-lg font-medium hover:bg-[#005a4b] transition-colors"
          >
            Salvar e Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2InformacoesBasicas;
