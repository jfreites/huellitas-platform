'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createReport } from '@/actions/reports';
import { AlertCircle, Camera, Check, FileText, ArrowRight, Compass } from 'lucide-react';

export default function NewReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Tipo de reporte inicial: perdido (LOST) o encontrado (FOUND)
  const [type, setType] = useState<'LOST' | 'FOUND'>('LOST');

  // Inicializar tipo desde URL Query Parameter si existe
  useEffect(() => {
    const urlType = searchParams.get('type');
    if (urlType === 'LOST' || urlType === 'FOUND') {
      setType(urlType);
    }
  }, [searchParams]);

  // Form Fields
  const [species, setSpecies] = useState<'DOG' | 'CAT'>('DOG');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  // Características
  const [hasCollar, setHasCollar] = useState(false);
  const [hasSpots, setHasSpots] = useState(false);
  const [hasChip, setHasChip] = useState(false);
  const [hasScars, setHasScars] = useState(false);
  const [distinctiveText, setDistinctiveText] = useState('');

  // Found-specific field
  const [foundStatus, setFoundStatus] = useState<'IN_SHELTER' | 'WANDERING' | 'FOUND_DEAD'>('IN_SHELTER');

  // Imagen
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manejar carga y conversión de imagen a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    // Límite de 4MB para evitar payloads base64 gigantescos
    if (file.size > 4 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo permitido es 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imagePreview) {
      setError('La foto principal de la mascota es obligatoria.');
      return;
    }

    if (!location.trim()) {
      setError('La ubicación es obligatoria.');
      return;
    }

    if (!date) {
      setError('La fecha es obligatoria.');
      return;
    }

    if (!contactPhone.trim()) {
      setError('El número telefónico de contacto es obligatorio.');
      return;
    }

    // Construir payload
    const payload: any = {
      type,
      species,
      location,
      date,
      description,
      contactPhone,
      imageUrl: imagePreview,
      hasCollar,
      hasSpots,
      hasChip,
      hasScars,
      distinctiveText,
    };

    if (type === 'LOST') {
      if (!name.trim()) {
        setError('El nombre de la mascota es obligatorio.');
        return;
      }
      if (!color.trim()) {
        setError('El color de la mascota es obligatorio.');
        return;
      }
      payload.name = name.trim();
      payload.color = color.trim();
      payload.status = 'LOST_ACTIVE';
    } else {
      payload.status = foundStatus;
      payload.name = name.trim() || 'Mascota sin nombre';
      payload.color = color.trim() || 'No especificado';
    }

    startTransition(async () => {
      const res = await createReport(payload);
      if (res.success) {
        router.refresh();
        router.push(`/reportes/${res.reportId}`);
      } else {
        setError(res.error || 'Ocurrió un error al guardar el reporte.');
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8">
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Publicar Nuevo Reporte de Mascota
        </h1>
        <p className="mt-2 text-sm text-foreground/60 max-w-xl mx-auto">
          Proporciona la información más detallada posible para facilitar la búsqueda o el resguardo del animal.
        </p>
      </div>

      {/* Selector de Tipo (Perdida vs Encontrada) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setType('LOST')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center ${
            type === 'LOST'
              ? 'border-lost bg-lost/5 text-lost font-bold'
              : 'border-border bg-card text-foreground/65 hover:border-foreground/20'
          }`}
        >
          <span className="text-2xl mb-1">🔴</span>
          <span className="text-sm">Perdí mi mascota</span>
          <span className="text-[10px] opacity-75 mt-0.5">Urgente, búsqueda activa</span>
        </button>

        <button
          type="button"
          onClick={() => setType('FOUND')}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all text-center ${
            type === 'FOUND'
              ? 'border-found bg-found/5 text-found font-bold'
              : 'border-border bg-card text-foreground/65 hover:border-foreground/20'
          }`}
        >
          <span className="text-2xl mb-1">🟢</span>
          <span className="text-sm">Encontré una mascota</span>
          <span className="text-[10px] opacity-75 mt-0.5">En resguardo o deambulando</span>
        </button>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 text-card-foreground shadow-sm space-y-6">
          
          {/* Subida de Imagen Principal */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/75">
              Foto Principal <span className="text-lost">*</span>
            </label>
            
            <div className="relative aspect-16/9 w-full rounded-2xl border-2 border-dashed border-border overflow-hidden bg-stone-50 dark:bg-stone-900/30 flex flex-col items-center justify-center group hover:border-lost/50 transition-colors">
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Mascota" className="h-full w-full object-cover" />
                  <label
                    htmlFor="pet-image"
                    className="absolute bottom-4 right-4 rounded-full bg-background/90 backdrop-blur-md border border-border px-3.5 py-1.5 text-xs font-bold shadow-md hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cambiar foto
                  </label>
                </>
              ) : (
                <label
                  htmlFor="pet-image"
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center"
                >
                  <div className="rounded-full bg-stone-100 dark:bg-stone-850 p-4 text-foreground/50 mb-3 group-hover:text-lost transition-colors">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-foreground/80">Sube una foto clara</span>
                  <span className="text-xs text-foreground/45 mt-1">Obligatorio. Formato JPG, PNG o WEBP. Máx 4MB.</span>
                </label>
              )}
              <input
                id="pet-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Especie */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/75">
              Especie <span className="text-lost">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSpecies('DOG')}
                className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${
                  species === 'DOG'
                    ? 'border-lost bg-lost/5 text-lost'
                    : 'border-border bg-background hover:bg-stone-50 dark:hover:bg-stone-900'
                }`}
              >
                🐕 Perro
              </button>
              <button
                type="button"
                onClick={() => setSpecies('CAT')}
                className={`py-3.5 rounded-xl border text-sm font-bold transition-all ${
                  species === 'CAT'
                    ? 'border-lost bg-lost/5 text-lost'
                    : 'border-border bg-background hover:bg-stone-50 dark:hover:bg-stone-900'
                }`}
              >
                🐈 Gato
              </button>
            </div>
          </div>

          {/* Datos Generales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Mascota */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                {type === 'LOST' ? 'Nombre de la Mascota *' : 'Nombre (si tiene placa/collar)'}
              </label>
              <input
                id="name"
                type="text"
                placeholder={type === 'LOST' ? 'ej. Firulais, Max' : 'ej. Desconocido, Placa dice Tobby'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
                required={type === 'LOST'}
              />
            </div>

            {/* Color Principal */}
            <div className="space-y-1.5">
              <label htmlFor="color" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                {type === 'LOST' ? 'Color(es) Predominante(s) *' : 'Color(es) Predominante(s)'}
              </label>
              <input
                id="color"
                type="text"
                placeholder="ej. Café con manchas blancas, Atigrado, Negro"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
                required={type === 'LOST'}
              />
            </div>
          </div>

          {/* Encontrado Estatus Específico */}
          {type === 'FOUND' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground/75">
                Estado del Animal <span className="text-lost">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFoundStatus('IN_SHELTER')}
                  className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                    foundStatus === 'IN_SHELTER'
                      ? 'border-found bg-found/5 text-found'
                      : 'border-border bg-background hover:bg-stone-50 dark:hover:bg-stone-900'
                  }`}
                >
                  🏡 En Resguardo Temporal
                </button>
                <button
                  type="button"
                  onClick={() => setFoundStatus('WANDERING')}
                  className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                    foundStatus === 'WANDERING'
                      ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400'
                      : 'border-border bg-background hover:bg-stone-50 dark:hover:bg-stone-900'
                  }`}
                >
                  🧭 Visto Deambulando libre
                </button>
                <button
                  type="button"
                  onClick={() => setFoundStatus('FOUND_DEAD')}
                  className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                    foundStatus === 'FOUND_DEAD'
                      ? 'border-stone-500 bg-stone-500/5 text-stone-600 dark:text-stone-400'
                      : 'border-border bg-background hover:bg-stone-50 dark:hover:bg-stone-900'
                  }`}
                >
                  🖤 Encontrado sin Vida
                </button>
              </div>
            </div>
          )}

          {/* Ubicación y Tiempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                {type === 'LOST' ? 'Último Lugar Visto *' : 'Lugar de Hallazgo *'}
              </label>
              <input
                id="location"
                type="text"
                placeholder="ej. Col. Centro, Av. Reforma entre Calle 4 y 6"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                {type === 'LOST' ? 'Fecha de Extravío *' : 'Fecha de Hallazgo *'}
              </label>
              <input
                id="date"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Características detalladas (Checkboxes) */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/75">
              Rasgos Distintivos y Elementos
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900">
                <input
                  type="checkbox"
                  checked={hasCollar}
                  onChange={(e) => setHasCollar(e.target.checked)}
                  className="rounded border-border text-lost focus:ring-lost h-4 w-4"
                />
                <span className="text-xs font-semibold">Tiene Collar</span>
              </label>
              
              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900">
                <input
                  type="checkbox"
                  checked={hasSpots}
                  onChange={(e) => setHasSpots(e.target.checked)}
                  className="rounded border-border text-lost focus:ring-lost h-4 w-4"
                />
                <span className="text-xs font-semibold">Manchas</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900">
                <input
                  type="checkbox"
                  checked={hasChip}
                  onChange={(e) => setHasChip(e.target.checked)}
                  className="rounded border-border text-lost focus:ring-lost h-4 w-4"
                />
                <span className="text-xs font-semibold">Tiene Chip</span>
              </label>

              <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-border bg-background cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900">
                <input
                  type="checkbox"
                  checked={hasScars}
                  onChange={(e) => setHasScars(e.target.checked)}
                  className="rounded border-border text-lost focus:ring-lost h-4 w-4"
                />
                <span className="text-xs font-semibold">Cicatrices</span>
              </label>
            </div>
          </div>

          {/* Rasgos distintivos texto libre */}
          <div className="space-y-1.5">
            <label htmlFor="distinctiveText" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
              Detalle de rasgos
            </label>
            <input
              id="distinctiveText"
              type="text"
              placeholder="ej. Ojo izquierdo azul, Oreja derecha mocha, Cola muy corta"
              value={distinctiveText}
              onChange={(e) => setDistinctiveText(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
            />
          </div>

          {/* Número de contacto & Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/60 pt-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label htmlFor="contactPhone" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                Celular de Contacto *
              </label>
              <input
                id="contactPhone"
                type="tel"
                placeholder="ej. +5215555555555"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-sm focus:border-lost focus:outline-none"
                required
              />
              <p className="text-[10px] text-foreground/45 mt-1 leading-normal">
                Obligatorio. Se mostrará en el póster e impresión.
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-foreground/70">
                Descripción Adicional / Historia
              </label>
              <textarea
                id="description"
                placeholder="Describe el temperamento de la mascota (si es asustadizo, amigable), cómo escapó o detalles del resguardo..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 px-3.5 text-sm focus:border-lost focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isPending}
          className={`w-full rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-98 cursor-pointer ${
            type === 'LOST'
              ? 'bg-lost hover:bg-rose-600 disabled:bg-rose-400'
              : 'bg-found hover:bg-emerald-700 disabled:bg-emerald-500'
          }`}
        >
          {isPending ? 'Guardando reporte...' : `Publicar Reporte de Mascota ${type === 'LOST' ? 'Perdida' : 'Encontrada'}`}
        </button>
      </form>
    </div>
  );
}
