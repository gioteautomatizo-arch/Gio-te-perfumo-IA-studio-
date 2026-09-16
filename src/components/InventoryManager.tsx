import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, FlaskConical, Save, Search } from 'lucide-react';
import { Perfume } from '../types';
import {
  EffectivePerfume,
  saveBusinessFields,
  subscribeCatalog,
} from '../lib/catalogService';

const toNumberOrUndefined = (value: string): number | undefined => {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const InventoryManager: React.FC = () => {
  const [catalog, setCatalog] = useState<EffectivePerfume[]>([]);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeCatalog(setCatalog, err => setError(err.message)), []);

  const visibleCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(perfume =>
      perfume.name.toLowerCase().includes(q) ||
      perfume.brand.toLowerCase().includes(q)
    );
  }, [catalog, search]);

  return (
    <section className="mt-8 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 pt-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">Inventario</p>
          <h3 className="font-serif italic text-xl text-[#1a1a1a] dark:text-[#f4f4f5]">Stock físico, decants y apartados</h3>
          <p className="text-xs text-[#666] dark:text-[#a1a1aa] mt-1 max-w-xl">
            Lleva desde ahora el control de piezas, mililitros disponibles y el apartado que quieres pedir por cada fragancia.
          </p>
        </div>
        <Boxes className="w-5 h-5 text-[#c5a059] shrink-0" />
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar perfume…"
          className="w-full bg-[#fcfaf7] dark:bg-[#0b0b0d] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 pl-9 pr-3 py-3 text-sm outline-none"
        />
      </div>

      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {visibleCatalog.map(perfume => (
          <InventoryRow
            key={perfume.id}
            perfume={perfume}
            saving={savingId === perfume.id}
            onSave={async fields => {
              setSavingId(perfume.id);
              setMessage(null);
              setError(null);
              try {
                await saveBusinessFields(perfume.id, fields);
                setMessage(`Inventario guardado: ${perfume.brand} ${perfume.name}`);
              } catch (err: any) {
                setError(err?.message || 'No se pudo guardar el inventario.');
              } finally {
                setSavingId(null);
              }
            }}
          />
        ))}
      </div>

      {message && (
        <p className="text-xs border border-emerald-600/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 p-3">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs border border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300 p-3 break-words">
          {error}
        </p>
      )}
    </section>
  );
};

const InventoryRow: React.FC<{
  perfume: EffectivePerfume;
  saving: boolean;
  onSave: (fields: {
    stockStatus: Perfume['stockStatus'];
    stockQuantity?: number;
    bottleVolumeML?: number;
    availableML?: number;
    decant5mlEnabled: boolean;
    decant5mlPriceMXN?: number | null;
    reservationDepositMXN?: number | null;
  }) => void;
}> = ({ perfume, saving, onSave }) => {
  const [stockStatus, setStockStatus] = useState<Perfume['stockStatus']>(perfume.stockStatus);
  const [stockQuantity, setStockQuantity] = useState(
    typeof perfume.stockQuantity === 'number' ? String(perfume.stockQuantity) : ''
  );
  const [bottleVolumeML, setBottleVolumeML] = useState(
    typeof perfume.bottleVolumeML === 'number' ? String(perfume.bottleVolumeML) : ''
  );
  const [availableML, setAvailableML] = useState(
    typeof perfume.availableML === 'number' ? String(perfume.availableML) : ''
  );
  const [decant5mlEnabled, setDecant5mlEnabled] = useState(Boolean(perfume.decant5mlEnabled));
  const [decantPrice, setDecantPrice] = useState(
    typeof perfume.decant5mlPriceMXN === 'number' ? String(perfume.decant5mlPriceMXN) : ''
  );
  const [deposit, setDeposit] = useState(
    typeof perfume.reservationDepositMXN === 'number' ? String(perfume.reservationDepositMXN) : ''
  );

  useEffect(() => {
    setStockStatus(perfume.stockStatus);
    setStockQuantity(typeof perfume.stockQuantity === 'number' ? String(perfume.stockQuantity) : '');
    setBottleVolumeML(typeof perfume.bottleVolumeML === 'number' ? String(perfume.bottleVolumeML) : '');
    setAvailableML(typeof perfume.availableML === 'number' ? String(perfume.availableML) : '');
    setDecant5mlEnabled(Boolean(perfume.decant5mlEnabled));
    setDecantPrice(typeof perfume.decant5mlPriceMXN === 'number' ? String(perfume.decant5mlPriceMXN) : '');
    setDeposit(typeof perfume.reservationDepositMXN === 'number' ? String(perfume.reservationDepositMXN) : '');
  }, [
    perfume.stockStatus,
    perfume.stockQuantity,
    perfume.bottleVolumeML,
    perfume.availableML,
    perfume.decant5mlEnabled,
    perfume.decant5mlPriceMXN,
    perfume.reservationDepositMXN,
  ]);

  return (
    <div className="border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 p-3 bg-[#f8f4ed] dark:bg-[#0f0f12] space-y-3">
      <div>
        <p className="font-semibold text-sm">{perfume.brand} · {perfume.name}</p>
        <p className="text-[10px] text-[#777]">{perfume.id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-[10px] uppercase tracking-wider text-[#777]">
          Estado
          <select
            value={stockStatus}
            onChange={e => setStockStatus(e.target.value as Perfume['stockStatus'])}
            className="mt-1 w-full bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 px-2 py-2 text-xs"
          >
            <option>Disponible</option>
            <option>Pocas Unidades</option>
            <option>Sobre pedido</option>
            <option>Reservado</option>
            <option>Agotado</option>
          </select>
        </label>

        <Field label="Piezas físicas" value={stockQuantity} onChange={setStockQuantity} />
        <Field label="Tamaño botella (ml)" value={bottleVolumeML} onChange={setBottleVolumeML} />
        <Field label="Ml disponibles" value={availableML} onChange={setAvailableML} />
        <Field label="Apartado MXN" value={deposit} onChange={setDeposit} />
      </div>

      <div className="border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 p-3 space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={decant5mlEnabled}
            onChange={e => setDecant5mlEnabled(e.target.checked)}
          />
          <FlaskConical className="w-4 h-4 text-[#c5a059]" />
          Vendo decant de 5 ml
        </label>
        {decant5mlEnabled && (
          <Field label="Precio decant 5 ml (MXN)" value={decantPrice} onChange={setDecantPrice} />
        )}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => onSave({
          stockStatus,
          stockQuantity: toNumberOrUndefined(stockQuantity),
          bottleVolumeML: toNumberOrUndefined(bottleVolumeML),
          availableML: toNumberOrUndefined(availableML),
          decant5mlEnabled,
          decant5mlPriceMXN:
            decant5mlEnabled && toNumberOrUndefined(decantPrice)
              ? toNumberOrUndefined(decantPrice)
              : null,
          reservationDepositMXN: toNumberOrUndefined(deposit) || null,
        })}
        className="w-full py-2.5 border border-[#c5a059]/50 text-[#c5a059] bg-[#1a1a1a] text-[10px] uppercase tracking-wider font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando…' : 'Guardar inventario'}
      </button>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="text-[10px] uppercase tracking-wider text-[#777]">
    {label}
    <input
      type="number"
      min="0"
      step="1"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="mt-1 w-full bg-transparent border border-[#1a1a1a]/15 dark:border-[#c5a059]/20 px-2 py-2 text-xs"
    />
  </label>
);
