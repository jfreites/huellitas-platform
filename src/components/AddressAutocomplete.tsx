'use client';

import { useCallback, useEffect, useRef } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

export interface AddressSelection {
  address: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (selection: AddressSelection) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  iconClassName?: string;
  inputClassName?: string;
  countryBias?: string[];
  apiKey: string;
}

const DEFAULT_INPUT_CLASS =
  'w-full rounded-xl border border-border bg-background py-2.5 pl-9.5 pr-4 text-sm focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all';

type PlaceAutocompleteFieldProps = Omit<
  AddressAutocompleteProps,
  'apiKey'
>;

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar dirección...',
  required = false,
  id = 'address-autocomplete',
  iconClassName = 'text-foreground/45',
  inputClassName = DEFAULT_INPUT_CLASS,
  countryBias = ['mx'],
  apiKey,
}: AddressAutocompleteProps) {
  if (!apiKey) {
    return (
      <FallbackInput
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        iconClassName={iconClassName}
        inputClassName={inputClassName}
        warning="Falta la clave de Google Maps. El autocompletado no está disponible; se enviará sin coordenadas."
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={['places']}>
      <PlaceAutocompleteField
        id={id}
        value={value}
        onChange={onChange}
        onSelect={onSelect}
        placeholder={placeholder}
        required={required}
        iconClassName={iconClassName}
        inputClassName={inputClassName}
        countryBias={countryBias}
      />
    </APIProvider>
  );
}

function PlaceAutocompleteField({
  value,
  onChange,
  onSelect,
  placeholder,
  required,
  id,
  iconClassName,
  inputClassName,
  countryBias,
}: PlaceAutocompleteFieldProps) {
  const ref = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleSelect = async (event: Event) => {
      const selectEvent = event as google.maps.places.PlacePredictionSelectEvent;
      const place = selectEvent.placePrediction?.toPlace();
      if (!place) return;

      try {
        const { place: fetched } = await place.fetchFields({
          fields: ['formattedAddress', 'location'],
        });
        const formatted = fetched.formattedAddress ?? '';
        const loc = fetched.location;
        if (!formatted || !loc) return;
        onSelectRef.current?.({
          address: formatted,
          lat: loc.lat(),
          lng: loc.lng(),
        });
      } catch (err) {
        console.error('Error al obtener detalles del lugar:', err);
      }
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      onChange(target.value);
    };

    el.addEventListener('gmp-select', handleSelect);
    el.addEventListener('input', handleInput);
    return () => {
      el.removeEventListener('gmp-select', handleSelect);
      el.removeEventListener('input', handleInput);
    };
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value !== el.value) {
      el.value = value;
    }
  }, [value]);

  const setRef = useCallback(
    (node: google.maps.places.PlaceAutocompleteElement | null) => {
      ref.current = node;
      if (node) {
        node.value = value;
        node.placeholder = placeholder ?? '';
        if (countryBias && countryBias.length > 0) {
          node.includedRegionCodes = countryBias;
        }
      }
    },
    // value/placeholder/countryBias intentionally only applied on mount
    // (subsequent changes are handled in the value-sync effect above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="relative">
      <MapPin
        className={`absolute top-3 left-3 h-4 w-4 z-10 pointer-events-none ${iconClassName}`}
      />
      <gmp-place-autocomplete
        ref={setRef}
        id={id}
        requested-language="es"
        className={inputClassName}
        style={{ width: '100%', display: 'block' }}
        aria-required={required ? 'true' : undefined}
      />
    </div>
  );
}

interface FallbackInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required: boolean;
  iconClassName: string;
  inputClassName: string;
  warning: string;
}

function FallbackInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  iconClassName,
  inputClassName,
  warning,
}: FallbackInputProps) {
  useEffect(() => {
    console.warn(`[AddressAutocomplete] ${warning}`);
  }, [warning]);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <MapPin
          className={`absolute top-3 left-3 h-4 w-4 z-10 pointer-events-none ${iconClassName}`}
        />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={inputClassName}
        />
      </div>
      <p className="text-[10px] text-amber-600 dark:text-amber-400">
        {warning}
      </p>
    </div>
  );
}
