import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Plus, Save, Search, Tag, Trash2 } from 'lucide-react';
import { Perfume } from '../types';
import {
  EffectivePerfume,
  removeCustomPerfume,
  saveBusinessFields,
  saveCustomPerfume,
  subscribeCatalog,
} from '../lib/catalogService';
import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_UPLOAD_URL,
} from '../lib/cloudinary';
import { InventoryManager } from './InventoryManager';

const splitCsv = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyForm = {
  brand: '',
  name: '',
  category: 'Diseñador',
  gender: 'Masculino',
  concentration: 'EDP',
  family: '',
  priceMXN: '',
  stockStatus: 'Disponible',
  description: '',
  duration: '',
  projection: '',
  topNotes: '',
  heartNotes: '',
  baseNotes: '',
  mainAccords: '',
  image: '',
};

export const AdminCatalogManager: React.FC = () => {
  const [catalog, setCatalog] = useState<EffectivePerfume[]>([]);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => subscribeCatalog(setCatalog, err => setError(err.message)), []);

  const visibleCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      perfume =>
        perfume.name.toLowerCase().includes(q) ||
        perfume.brand.toLowerCase().includes(q) ||
        perfume.id.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  const handleUpdateBusiness = async (
    perfume: EffectivePerfume,
    values: {
      priceMXN: number;
      promoActive: boolean;
      promoPriceMXN: number | null;
      promoLabel: string;
      stockStatus: Perfume['stockStatus'];
    }
  ) => {
    setSavingId(perfume.id);
    setError(null);
    setMessage(null);
    try {
      await saveBusinessFields(perfume.id, values);
      setMessage(`Guardado: ${perfume.brand} ${perfume.name}`);
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar el perfume.');
    } finally {
      setSavingId(null);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(CLOUDINARY_UPLOAD_URL, { method: 'POST', body });
      if (!response.ok) throw new Error('Cloudinary rechazó la imagen.');
      const data = await response.json();
      if (!data.secure_url) throw new Error('Cloudinary no devolvió una URL segura.');
      setForm(prev => ({ ...prev, image: data.secure_url }));
      setMessage('Imagen subida correctamente.');
    } catch (err: any) {
      setError(err?.message || 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const price = Number(form.priceMXN);
    if (!form.brand.trim() || !form.name.trim() || !form.family.trim() || !price) {
      setError('Marca, nombre, familia y precio son obligatorios.');
      return;
    }
    if (!form.image) {
      setError('Sube una imagen antes de guardar el perfume.');
      return;
    }

    const id = slugify(`${form.brand}-${form.name}`);
    const perfume: Perfume = {
      id,
      name: form.name.trim(),
      brand: form.brand.trim(),
      country: 'Por definir',
      year: new Date().getFullYear(),
      category: form.category as Perfume['category'],
      gender: form.gender,
      family: form.family,
      topNotes: splitCsv(form.topNotes),
      heartNotes: splitCsv(form.heartNotes),
      baseNotes: splitCsv(form.baseNotes),
      mainAccords: splitCsv(form.mainAccords),
      concentration: form.concentration as Perfume['concentration'],
      duration: form.duration.trim() || 'Por evaluar en uso real',
      projection: form.projection.trim() || 'Por evaluar en uso real',
      sillage: 'Por evaluar',
      bestSeason: [],
      bestTime: [],
      recommendedOccasions: [],
      personalityMatch: [],
      emotions: [],
      versatility: 5,
      priceMXN: price,
      priceCategory: price < 1200 ? 'Accesible' : price < 2200 ? 'Intermedio' : price < 3500 ? 'Premium' : 'Lujo',
      valueForMoney: 5,
      image: form.image,
      description: form.description.trim() || 'Ficha en construcción.',
      usageExperience: 'Pendiente de registrar experiencia de uso real.',
      stockStatus: form.stockStatus as Perfume['stockStatus'],
      originalGuaranteed: true,
    };

    setSavingId(id);
    try {
      await saveCustomPerfume(perfume);
      setForm(emptyForm);
      setMessage(`Perfume agregado: ${perfume.brand} ${perfume.name}`);
    } catch (err: any) {
      setError(err?.message || 'No se pudo agregar el perfume.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mt-7 space-y-8">
      <div className="border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 pt-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">Catálogo vivo</p>
            <h3 className="font-serif italic text-xl text-[#1a1a1a] dark:text-[#f4f4f5]">Precios, promos y stock</h3>
          </div>
          <span className="text-xs text-[#777]">{catalog.length} perfumes</span>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar perfume…"
            className="w-full bg-[#fcfaf7] dark:bg-[#0b0b0d] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 pl-9 pr-3 py-3 text-sm outline-none"
          />
        </div>

        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {visibleCatalog.map(perfume => (
            <EditablePerfumeRow
              key={perfume.id}
              perfume={perfume}
              saving={savingId === perfume.id}
              onSave={values => handleUpdateBusiness(perfume, values)}
              onDelete={
                perfume.catalogSource === 'custom'
                  ? async () => {
                      if (!window.confirm(`¿Eliminar ${perfume.brand} ${perfume.name}?`)) return;
                      try {
                        await removeCustomPerfume(perfume.id);
                        setMessage('Perfume eliminado del catálogo.');
                      } catch (err: any) {
                        setError(err?.message || 'No se pudo eliminar.');
                      }
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleCreate} className="border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 pt-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">Nuevo perfume</p>
          <h3 className="font-serif italic text-xl text-[#1a1a1a] dark:text-[#f4f4f5]">Agregar al catálogo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AdminInput label="Marca" value={form.brand} onChange={value => setForm(p => ({ ...p, brand: value }))} />
          <AdminInput label="Nombre" value={form.name} onChange={value => setForm(p => ({ ...p, name: value }))} />
          <AdminInput label="Familia olfativa" value={form.family} onChange={value => setForm(p => ({ ...p, family: value }))} />
          <AdminInput label="Precio MXN" type="number" value={form.priceMXN} onChange={value => setForm(p => ({ ...p, priceMXN: value }))} />
          <AdminInput label="Concentración" value={form.concentration} onChange={value => setForm(p => ({ ...p, concentration: value }))} />
          <AdminInput label="Género" value={form.gender} onChange={value => setForm(p => ({ ...p, gender: value }))} />
          <AdminInput label="Categoría" value={form.category} onChange={value => setForm(p => ({ ...p, category: value }))} />
          <AdminInput label="Duración" value={form.duration} onChange={value => setForm(p => ({ ...p, duration: value }))} />
          <AdminInput label="Proyección" value={form.projection} onChange={value => setForm(p => ({ ...p, projection: value }))} />
          <AdminInput label="Acordes (separados por coma)" value={form.mainAccords} onChange={value => setForm(p => ({ ...p, mainAccords: value }))} />
          <AdminInput label="Notas salida" value={form.topNotes} onChange={value => setForm(p => ({ ...p, topNotes: value }))} />
          <AdminInput label="Notas corazón" value={form.heartNotes} onChange={value => setForm(p => ({ ...p, heartNotes: value }))} />
          <AdminInput label="Notas fondo" value={form.baseNotes} onChange={value => setForm(p => ({ ...p, baseNotes: value }))} />
        </div>

        <textarea
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Descripción breve"
          rows={3}
          className="w-full bg-[#fcfaf7] dark:bg-[#0b0b0d] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 px-3 py-3 text-sm outline-none"
        />

        <label className="block border border-dashed border-[#c5a059]/50 p-4 cursor-pointer text-center">
          <ImagePlus className="w-5 h-5 text-[#c5a059] mx-auto mb-2" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            {uploading ? 'Subiendo imagen…' : form.image ? 'Imagen lista · Cambiar' : 'Subir PNG/JPG/WebP'}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
        </label>

        {form.image && (
          <img src={form.image} alt="Vista previa" className="w-28 h-28 object-contain border border-[#1a1a1a]/10 mx-auto" />
        )}

        <button
          type="submit"
          disabled={Boolean(savingId) || uploading}
          className="w-full min-h-[46px] px-4 py-3 bg-[#1a1a1a] text-[#c5a059] border border-[#c5a059]/70 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Agregar perfume
        </button>
      </form>

      <InventoryManager />

      {message && <p className="text-xs border border-emerald-600/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 p-3">{message}</p>}
      {error && <p className="text-xs border border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300 p-3 break-words">{error}</p>}
    </div>
  );
};

const EditablePerfumeRow: React.FC<{
  perfume: EffectivePerfume;
  saving: boolean;
  onSave: (values: {
    priceMXN: number;
    promoActive: boolean;
    promoPriceMXN: number | null;
    promoLabel: string;
    stockStatus: Perfume['stockStatus'];
  }) => void;
  onDelete?: () => void;
}> = ({ perfume, saving, onSave, onDelete }) => {
  const [price, setPrice] = useState(String(perfume.priceMXN));
  const [promoActive, setPromoActive] = useState(Boolean(perfume.promoActive));
  const [promoPrice, setPromoPrice] = useState(perfume.promoPriceMXN ? String(perfume.promoPriceMXN) : '');
  const [promoLabel, setPromoLabel] = useState(perfume.promoLabel || '');
  const [stockStatus, setStockStatus] = useState<Perfume['stockStatus']>(perfume.stockStatus);

  useEffect(() => {
    setPrice(String(perfume.priceMXN));
    setPromoActive(Boolean(perfume.promoActive));
    setPromoPrice(perfume.promoPriceMXN ? String(perfume.promoPriceMXN) : '');
    setPromoLabel(perfume.promoLabel || '');
    setStockStatus(perfume.stockStatus);
  }, [perfume.priceMXN, perfume.promoActive, perfume.promoPriceMXN, perfume.promoLabel, perfume.stockStatus]);

  return (
    <div className="border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 p-3 bg-[#f8f4ed] dark:bg-[#0f0f12]">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{perfume.brand} · {perfume.name}</p>
          <p className="text-[10px] text-[#777] truncate">{perfume.id}</p>
        </div>
        {onDelete && (
          <button type="button" onClick={onDelete} className="p-2 text-red-600" title="Eliminar perfume">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 px-2 py-2 text-xs" placeholder="Precio" />
        <select value={stockStatus} onChange={e => setStockStatus(e.target.value as Perfume['stockStatus'])} className="bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 px-2 py-2 text-xs">
          <option>Disponible</option>
          <option>Pocas Unidades</option>
          <option>Sobre pedido</option>
          <option>Reservado</option>
          <option>Agotado</option>
        </select>
      </div>

      <label className="mt-3 flex items-center gap-2 text-xs">
        <input type="checkbox" checked={promoActive} onChange={e => setPromoActive(e.target.checked)} />
        Promoción activa
      </label>

      {promoActive && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input type="number" value={promoPrice} onChange={e => setPromoPrice(e.target.value)} className="bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 px-2 py-2 text-xs" placeholder="Precio promo" />
          <div className="relative">
            <Tag className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[#c5a059]" />
            <input value={promoLabel} onChange={e => setPromoLabel(e.target.value)} className="w-full bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 pl-7 pr-2 py-2 text-xs" placeholder="OFERTA" />
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={() => onSave({
          priceMXN: Number(price),
          promoActive,
          promoPriceMXN: promoActive && Number(promoPrice) > 0 ? Number(promoPrice) : null,
          promoLabel,
          stockStatus,
        })}
        className="mt-3 w-full py-2 border border-[#c5a059]/50 text-[#c5a059] bg-[#1a1a1a] text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  );
};

const AdminInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}> = ({ label, value, onChange, type = 'text' }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-wider text-[#777] mb-1">{label}</span>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[#fcfaf7] dark:bg-[#0b0b0d] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 px-3 py-2.5 text-sm outline-none"
    />
  </label>
);
