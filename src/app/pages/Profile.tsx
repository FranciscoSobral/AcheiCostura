import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  clearOtherImages,
  fetchOtherImages,
  getUserById,
  updateUser,
  uploadOtherImages,
  uploadProfileImage,
} from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  User2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  street: string;
  zipCode: string;
  category: string;
  type: string;
  description: string;
  instagram: string;
  whatsapp: string;
  website: string;
};

const DEFAULT_AVATAR_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
    <rect width="320" height="320" fill="#E2E8F0"/>
    <circle cx="160" cy="118" r="58" fill="#94A3B8"/>
    <path d="M52 286c16-49 56-82 108-82s92 33 108 82" fill="#94A3B8"/>
  </svg>`
)}`;
const MAX_PROFILE_FILE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_FILE_SIZE = 8 * 1024 * 1024;

const emptyForm: ProfileForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  country: '',
  street: '',
  zipCode: '',
  category: '',
  type: '',
  description: '',
  instagram: '',
  whatsapp: '',
  website: '',
};

const parseFormFromUser = (payload: any): ProfileForm => ({
  name: payload?.name || '',
  email: payload?.email || '',
  phone: payload?.phone || '',
  city: payload?.city || '',
  state: payload?.state || '',
  country: payload?.country || '',
  street: payload?.street || '',
  zipCode: payload?.zipCode || '',
  category: payload?.category || '',
  type: payload?.type || '',
  description: payload?.description || '',
  instagram: payload?.instagram || '',
  whatsapp: payload?.whatsapp || '',
  website: payload?.website || '',
});

const normalizeImageSource = (value?: string | null): string | null => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:') || value.startsWith('http')) return value;
  // backend pode devolver apenas o base64 sem prefixo
  return `data:image/jpeg;base64,${value}`;
};

const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
};

const remoteUrlToFile = async (url: string, fileName: string): Promise<File> => {
  if (url.startsWith('data:')) {
    return dataUrlToFile(url, fileName);
  }

  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel converter uma imagem da galeria.');
  }

  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
};

const ProfileField = ({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  id: keyof ProfileForm;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white/90"
    />
  </div>
);

export const Profile = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileImageUrl, setProfileImageUrl] = useState(DEFAULT_AVATAR_URL);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [syncingGallery, setSyncingGallery] = useState(false);

  const profileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const isLogged = Boolean(user?.id);

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncAuthUser = useCallback(
    (payload: any) => {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      login(
        {
          id: payload?.id || user.id,
          name: payload?.name || form.name || user.name,
          email: payload?.email || form.email || user.email,
          coins: payload?.coins ?? user.coins ?? 0,
          city: payload?.city ?? form.city ?? user.city,
          state: payload?.state ?? form.state ?? user.state,
          role: payload?.role || user.role,
          avatar: payload?.avatar || payload?.profileImage || profileImageUrl,
        },
        token
      );
    },
    [form.city, form.email, form.name, form.state, login, profileImageUrl, user]
  );

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [fullUser, otherImgs] = await Promise.all([
        getUserById(user.id).catch(() => null),
        fetchOtherImages(user.id).catch(() => []),
      ]);

      const source = fullUser || user;
      setForm(parseFormFromUser(source));

      const normalizedProfileFromUser = normalizeImageSource(source?.profileImage);
      setProfileImageUrl(normalizedProfileFromUser || DEFAULT_AVATAR_URL);
      setGalleryImages(Array.isArray(otherImgs) ? otherImgs : []);
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast.error('Nao foi possivel carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLogged) {
      navigate('/login');
      return;
    }
    loadData();
  }, [authLoading, isLogged, loadData, navigate]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const updated = await updateUser(user.id, {
        ...form,
        state: form.state.toUpperCase(),
      });
      syncAuthUser(updated);
      toast.success('Perfil atualizado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel salvar as alteracoes.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user?.id) return;

    if (file.size > MAX_PROFILE_FILE_SIZE) {
      toast.error('A foto de perfil deve ter no maximo 5MB.');
      return;
    }

    const previous = profileImageUrl;
    const localPreview = URL.createObjectURL(file);
    setProfileImageUrl(localPreview);
    setUploadingProfileImage(true);

    try {
      await uploadProfileImage(file, user.id);
      const refreshedUser = await getUserById(user.id).catch(() => null);
      const serverProfileImage = normalizeImageSource(refreshedUser?.profileImage);
      const finalUrl = serverProfileImage || localPreview;
      setProfileImageUrl(finalUrl);
      syncAuthUser({ avatar: finalUrl, profileImage: finalUrl });
      toast.success('Foto de perfil atualizada.');
    } catch (error: any) {
      setProfileImageUrl(previous || DEFAULT_AVATAR_URL);
      toast.error(error?.message || 'Nao foi possivel atualizar a foto de perfil.');
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingProfileImage(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!user?.id) return;
    setUploadingProfileImage(true);
    try {
      await updateUser(user.id, { profileImage: null });
      setProfileImageUrl(DEFAULT_AVATAR_URL);
      syncAuthUser({ avatar: undefined, profileImage: undefined });
      toast.success('Foto de perfil removida.');
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel remover a foto de perfil.');
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleAddGalleryImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || !user?.id) return;

    const invalid = files.find((file) => file.size > MAX_GALLERY_FILE_SIZE);
    if (invalid) {
      toast.error('Cada imagem da galeria deve ter no maximo 8MB.');
      return;
    }

    setUploadingGalleryImages(true);
    try {
      await uploadOtherImages(files, user.id);
      const freshGallery = await fetchOtherImages(user.id);
      setGalleryImages(freshGallery);
      toast.success(
        files.length === 1
          ? 'Imagem adicionada na galeria.'
          : `${files.length} imagens adicionadas na galeria.`
      );
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel adicionar imagens.');
    } finally {
      setUploadingGalleryImages(false);
    }
  };

  const rebuildGalleryWithoutIndex = async (indexToRemove: number) => {
    if (!user?.id) return;

    const remainingUrls = galleryImages.filter((_, index) => index !== indexToRemove);
    setSyncingGallery(true);

    try {
      const files = await Promise.all(
        remainingUrls.map((url, index) =>
          remoteUrlToFile(url, `gallery-${Date.now()}-${index + 1}.jpg`)
        )
      );

      await clearOtherImages(user.id);
      if (files.length > 0) {
        await uploadOtherImages(files, user.id);
      }

      setGalleryImages(remainingUrls);
      toast.success('Imagem removida da galeria.');
    } catch (error: any) {
      toast.error(
        error?.message ||
          'Nao foi possivel remover esta imagem. Tente remover todas e reenviar.'
      );
    } finally {
      setSyncingGallery(false);
    }
  };

  const handleClearGallery = async () => {
    if (!user?.id) return;

    setSyncingGallery(true);
    try {
      await clearOtherImages(user.id);
      setGalleryImages([]);
      toast.success('Galeria limpa com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel limpar a galeria.');
    } finally {
      setSyncingGallery(false);
    }
  };

  if (!isLogged) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0fdf4,_#f8fafc_55%)] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-28 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />
          <CardContent className="px-6 md:px-8 pb-6 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-md">
                  <img
                    src={profileImageUrl || DEFAULT_AVATAR_URL}
                    alt="Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Minha conta</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {form.name || 'Seu perfil'}
                  </h1>
                  <p className="text-slate-600">{form.email || 'Sem e-mail informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <User2 className="w-3.5 h-3.5 mr-1" />
                  {user?.role || 'Usuario'}
                </Badge>
                <Button variant="outline" onClick={loadData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar alteracoes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Foto de perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border">
                  <img
                    src={profileImageUrl || DEFAULT_AVATAR_URL}
                    alt="Preview do perfil"
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageUpload}
                />

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => profileInputRef.current?.click()}
                    disabled={uploadingProfileImage}
                  >
                    {uploadingProfileImage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    Trocar foto
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleRemoveProfileImage}
                    disabled={uploadingProfileImage}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover foto
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Formatos aceitos: JPG, PNG, WEBP. Maximo 5MB.</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Galeria de trabalhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddGalleryImages}
                />
                <Button
                  className="w-full"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGalleryImages || syncingGallery}
                >
                  {uploadingGalleryImages ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4 mr-2" />
                  )}
                  Adicionar imagens
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleClearGallery}
                  disabled={syncingGallery || uploadingGalleryImages || galleryImages.length === 0}
                >
                  {syncingGallery ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Limpar galeria
                </Button>
                <p className="text-xs text-slate-500">
                  Dica: imagens da galeria ajudam as empresas a avaliarem seu trabalho.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Dados basicos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField
                  label="Nome completo"
                  id="name"
                  value={form.name}
                  onChange={(value) => updateField('name', value)}
                  placeholder="Seu nome"
                />
                <ProfileField
                  label="E-mail"
                  id="email"
                  value={form.email}
                  onChange={(value) => updateField('email', value)}
                  placeholder="voce@email.com"
                  type="email"
                />
                <ProfileField
                  label="Telefone"
                  id="phone"
                  value={form.phone}
                  onChange={(value) => updateField('phone', value)}
                  placeholder="(00) 00000-0000"
                />
                <ProfileField
                  label="WhatsApp"
                  id="whatsapp"
                  value={form.whatsapp}
                  onChange={(value) => updateField('whatsapp', value)}
                  placeholder="(00) 00000-0000"
                />
                <ProfileField
                  label="Categoria"
                  id="category"
                  value={form.category}
                  onChange={(value) => updateField('category', value)}
                  placeholder="Moda praia, bordado, etc."
                />
                <ProfileField
                  label="Tipo de perfil"
                  id="type"
                  value={form.type}
                  onChange={(value) => updateField('type', value)}
                  placeholder="COUTURIER ou EMPRESA"
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Endereco e presenca online</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProfileField
                  label="Cidade"
                  id="city"
                  value={form.city}
                  onChange={(value) => updateField('city', value)}
                  placeholder="Sua cidade"
                />
                <ProfileField
                  label="Estado (UF)"
                  id="state"
                  value={form.state}
                  onChange={(value) => updateField('state', value.toUpperCase())}
                  placeholder="SP"
                />
                <ProfileField
                  label="Pais"
                  id="country"
                  value={form.country}
                  onChange={(value) => updateField('country', value)}
                  placeholder="Brasil"
                />
                <ProfileField
                  label="CEP"
                  id="zipCode"
                  value={form.zipCode}
                  onChange={(value) => updateField('zipCode', value)}
                  placeholder="00000-000"
                />
                <div className="md:col-span-2">
                  <ProfileField
                    label="Endereco"
                    id="street"
                    value={form.street}
                    onChange={(value) => updateField('street', value)}
                    placeholder="Rua, numero, bairro"
                  />
                </div>
                <ProfileField
                  label="Instagram"
                  id="instagram"
                  value={form.instagram}
                  onChange={(value) => updateField('instagram', value)}
                  placeholder="@seuperfil"
                />
                <ProfileField
                  label="Website"
                  id="website"
                  value={form.website}
                  onChange={(value) => updateField('website', value)}
                  placeholder="https://seusite.com"
                />
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Descricao profissional</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    placeholder="Conte sobre experiencia, especialidades e diferenciais."
                    className="bg-white/90"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Suas imagens adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            {galleryImages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-3">Voce ainda nao adicionou imagens na galeria.</p>
                <Button onClick={() => galleryInputRef.current?.click()} disabled={uploadingGalleryImages}>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Adicionar primeiras imagens
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="group relative rounded-xl overflow-hidden border bg-white">
                    <img
                      src={imageUrl}
                      alt={`Galeria ${index + 1}`}
                      className="w-full h-40 object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => rebuildGalleryWithoutIndex(index)}
                      disabled={syncingGallery || uploadingGalleryImages}
                      className="absolute top-2 right-2 rounded-full bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remover imagem ${index + 1}`}
                    >
                      {syncingGallery ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
