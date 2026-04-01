import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useCadastro } from '../context/CadastroContext';
import { updateUser, uploadOtherImages, uploadProfileImage } from '../services/api';
import SpeechButton from './SpeechButton';
import ImageGalleryModal from './ImageGalleryModal';

interface Step3Props {
  onBack: () => void;
}

const Step3PerfilProfissional: React.FC<Step3Props> = ({ onBack }) => {
  const navigate = useNavigate();
  const { userId, step3Data, setStep3Data, setLoading, error, setError, resetCadastro } = useCadastro();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    step3Data.profileImagePreview || null
  );
  const [otherImagesPreviews, setOtherImagesPreviews] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherFilesInputRef = useRef<HTMLInputElement>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSelectedIndex, setModalSelectedIndex] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStep3Data((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, profileImage: 'A imagem deve ter no máximo 2MB' }));
      return;
    }
    if (!file.type.match('image.*')) {
      setFormErrors((prev) => ({
        ...prev,
        profileImage: 'Por favor, selecione uma imagem válida',
      }));
      return;
    }
    setStep3Data((prev) => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onload = (e) => setProfileImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setFormErrors((prev) => ({ ...prev, profileImage: '' }));
  };

  const removeImage = () => {
    setStep3Data((prev) => ({ ...prev, profileImage: null }));
    setProfileImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOtherImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validFiles = files.filter((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          otherImages: 'Cada imagem deve ter no máximo 2MB',
        }));
        return false;
      }
      if (!file.type.match('image.*')) {
        setFormErrors((prev) => ({
          ...prev,
          otherImages: 'Por favor, selecione apenas imagens válidas',
        }));
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setStep3Data((prev) => ({
      ...prev,
      otherImages: [...prev.otherImages, ...validFiles],
    }));
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setOtherImagesPreviews((prev) => [...prev, ...previews]);
    setFormErrors((prev) => ({ ...prev, otherImages: '' }));
  };

  const removeOtherImage = (index: number) => {
    setStep3Data((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
    }));
    setOtherImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    if (modalOpen && index === modalSelectedIndex) {
      const newIndex =
        otherImagesPreviews.length > 1 ? Math.min(index, otherImagesPreviews.length - 2) : 0;
      setModalSelectedIndex(newIndex);
    }
  };

  const handleSubmit = async (action: 'save' | 'finish') => {
    setLoading(true);
    setError(null);
    setSaving(true);

    try {
      // Salvar dados no backend
      if (!userId) {
        throw new Error('Usuário não identificado. Refaça o cadastro.');
      }

      const payload: Record<string, string> = {};
      if (step3Data.phone) payload.phone = step3Data.phone;
      if (step3Data.whatsapp) payload.whatsapp = step3Data.whatsapp;
      if (step3Data.instagram) payload.instagram = step3Data.instagram;
      if (step3Data.website) payload.website = step3Data.website;

      if (Object.keys(payload).length > 0) {
        await updateUser(userId, payload);
      }

      if (step3Data.profileImage) {
        await uploadProfileImage(step3Data.profileImage);
      }

      if (step3Data.otherImages.length > 0) {
        await uploadOtherImages(step3Data.otherImages);
      }

      if (action === 'save') {
        alert('Informações salvas com sucesso!');
      } else if (action === 'finish') {
        resetCadastro();
        navigate('/');
        alert('Cadastro concluído com sucesso!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar informações. Tente novamente.');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const handleSkip = () => {
    resetCadastro();
    navigate('/');
  };

  const handleOpenModal = (index: number) => {
    setModalSelectedIndex(index);
    setModalOpen(true);
  };

  const handleSelectImage = (index: number) => {
    setModalSelectedIndex(index);
  };

  const handleRemoveImage = (index: number) => {
    removeOtherImage(index);
  };

  return (
    <div className="step-container">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Contato e Imagens</h2>
      <p className="step-description text-gray-600 mb-6">
        Adicione suas informações de contato e imagens
        <span className="optional-badge ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
          Opcional
        </span>
      </p>

      <form className="space-y-6">
        {/* Foto de Perfil */}
        <div className="form-section bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Foto de Perfil</h3>
          <div className="profile-image-upload">
            {profileImagePreview ? (
              <div className="image-preview relative w-32 h-32 mx-auto">
                <img
                  src={profileImagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-4 border-green-500"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="remove-image-btn absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  id="profileImage"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label htmlFor="profileImage" className="cursor-pointer">
                  <span className="upload-icon text-4xl block mb-2">📷</span>
                  <span className="block text-gray-700 font-medium mb-1">
                    Clique para adicionar uma foto
                  </span>
                  <small className="text-gray-500">JPG, PNG (Max: 2MB)</small>
                </label>
              </div>
            )}
            {formErrors.profileImage && (
              <span className="error-text text-red-500 text-sm mt-2 block">
                {formErrors.profileImage}
              </span>
            )}
          </div>
        </div>

        {/* Outras Imagens */}
        <div className="form-section bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Outras Imagens (Portfólio)</h3>

          <div className="other-images-upload">
            <input
              type="file"
              id="otherImages"
              ref={otherFilesInputRef}
              onChange={handleOtherImagesUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            <label
              htmlFor="otherImages"
              className="upload-label border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer block"
            >
              <span className="upload-icon text-3xl block mb-2">🖼️</span>
              <span className="block text-gray-700 font-medium mb-1">
                Clique para adicionar imagens
              </span>
              <small className="text-gray-500">Você pode selecionar várias</small>
            </label>
            {formErrors.otherImages && (
              <span className="error-text text-red-500 text-sm mt-2 block">
                {formErrors.otherImages}
              </span>
            )}
          </div>

          {otherImagesPreviews.length > 0 && (
            <div className="thumbnails-grid grid grid-cols-4 gap-4 mt-4">
              {otherImagesPreviews.map((preview, index) => (
                <div key={index} className="thumbnail-item relative">
                  <img
                    src={preview}
                    alt={`Miniatura ${index}`}
                    className="thumbnail-image w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => handleOpenModal(index)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOtherImage(index)}
                    className="remove-thumbnail-btn absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    title="Remover imagem"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de visualização */}
        <ImageGalleryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          images={otherImagesPreviews.map((preview) => ({ preview }))}
          selectedIndex={modalSelectedIndex}
          onSelectImage={handleSelectImage}
          onRemoveImage={handleRemoveImage}
        />

        {/* Descrição */}
        <div className="form-section bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Sobre você</h3>
          <div className="form-group">
            <div className="form-label-container flex items-center justify-between mb-2">
              <label htmlFor="description" className="font-medium text-gray-700">
                Descrição profissional
              </label>
              <SpeechButton textToSpeak="Descrição profissional" />
            </div>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={step3Data.description || ''}
              onChange={handleChange}
              placeholder="Conte um pouco sobre sua experiência..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <small className="field-hint text-gray-500 text-sm block mt-1">
              Uma boa descrição ajuda clientes a te encontrarem
            </small>
          </div>
        </div>

        {error && <div className="error-message bg-red-100 text-red-700 p-3 rounded">{error}</div>}

        <div className="form-navigation flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              type="button"
              className="btn-back flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              onClick={onBack}
            >
              Voltar
            </button>
            <div className="form-actions flex gap-4 flex-[2]">
              <button
                type="button"
                className="btn-save flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                onClick={() => handleSubmit('save')}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              <button
                type="button"
                className="btn-finish flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                onClick={() => handleSubmit('finish')}
                disabled={saving}
              >
                {saving ? 'Finalizando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn-skip text-gray-600 hover:text-gray-800 transition-colors underline"
            onClick={handleSkip}
          >
            Pular esta etapa
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step3PerfilProfissional;
