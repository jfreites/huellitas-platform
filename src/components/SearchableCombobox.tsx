'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';

export interface SearchableOption {
  name: string;
  slug: string;
}

interface SearchableComboboxProps<T extends SearchableOption> {
  options: readonly T[];
  value: string | null;
  onChange: (slug: string | null) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  icon?: ReactNode;
  emptyMessage?: string;
  id?: string;
  inputClassName?: string;
  disabled?: boolean;
}

const BASE_INPUT_CLASS =
  'w-full rounded-xl border border-border bg-background py-2.5 pl-9.5 pr-9 text-sm focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all';

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function filterOptions<T extends SearchableOption>(
  options: readonly T[],
  query: string,
): T[] {
  if (!query) return [...options];
  const q = normalize(query);
  return options.filter(
    (opt) =>
      normalize(opt.name).includes(q) || opt.slug.toLowerCase().includes(q),
  );
}

export default function SearchableCombobox<T extends SearchableOption>({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  required = false,
  name,
  icon,
  emptyMessage = 'Sin resultados',
  id,
  inputClassName = BASE_INPUT_CLASS,
  disabled = false,
}: SearchableComboboxProps<T>) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.slug === value) ?? null;

  const filtered = filterOptions(options, query);

  const open = useCallback(() => {
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    setQuery(selectedOption ? '' : query);
  }, [selectedOption, query]);

  const selectOption = useCallback(
    (opt: T) => {
      onChange(opt.slug);
      setQuery('');
      close();
      inputRef.current?.focus();
    },
    [onChange, close],
  );

  const clear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setQuery('');
      inputRef.current?.focus();
    },
    [onChange],
  );

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, close]);

  // Sync query when value changes externally
  useEffect(() => {
    if (!isOpen && value && selectedOption) {
      setQuery('');
    }
  }, [value, isOpen, selectedOption]);

  // Sync query when options change
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        open();
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          selectOption(filtered[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        close();
        break;
      }
      case 'Tab': {
        if (activeIndex >= 0 && filtered[activeIndex]) {
          e.preventDefault();
          selectOption(filtered[activeIndex]);
        } else {
          close();
        }
        break;
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) open();
  };

  const handleContainerClick = () => {
    if (!disabled) {
      inputRef.current?.focus();
      if (!isOpen) open();
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const inputId = id ?? `combobox-${name ?? 'unnamed'}`;
  const listboxId = `${inputId}-listbox`;

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for native form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ?? ''}
          required={required}
          onInvalid={(e) => {
            if (required && !value) {
              e.preventDefault();
              inputRef.current?.setCustomValidity(
                'Selecciona una opción de la lista.',
              );
            }
          }}
          onChange={() => {}}
        />
      )}

      {/* Trigger */}
      <div
        className={`relative cursor-text ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleContainerClick}
      >
        {icon && (
          <span className="absolute top-3 left-3 h-4 w-4 text-foreground/45 pointer-events-none z-10">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${inputId}-option-${activeIndex}` : undefined
          }
          aria-invalid={required && !value}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          value={isOpen ? query : selectedOption?.name ?? ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!isOpen && !disabled) open();
          }}
          placeholder={placeholder}
          className={`${inputClassName} ${icon ? 'pl-9.5' : 'pl-3.5'} ${!isOpen && selectedOption ? 'pr-9' : 'pr-4'}`}
        />

        {/* Clear button */}
        {!disabled && value && !isOpen && (
          <button
            type="button"
            onClick={clear}
            className="absolute top-1/2 -translate-y-1/2 right-2.5 h-5 w-5 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground/70 transition-colors"
            aria-label="Limpiar selección"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Chevron indicator */}
        {!value && (
          <span className="absolute top-3 right-3 h-4 w-4 pointer-events-none">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-4 w-4 text-foreground/40"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={placeholder}
          className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-card rounded-xl border border-border shadow-md max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="py-3 px-3.5 text-sm text-foreground/50 text-center">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((opt, i) => {
              const isActive = i === activeIndex;
              const isSelected = opt.slug === value;
              return (
                <li
                  key={opt.slug}
                  id={`${inputId}-option-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(opt)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`
                    py-2.5 px-3.5 text-sm cursor-pointer transition-colors
                    ${isActive ? 'bg-lost/10 text-lost' : 'text-foreground/80'}
                    ${isSelected ? 'font-semibold' : ''}
                    ${i === 0 ? 'rounded-t-xl' : ''}
                    ${i === filtered.length - 1 ? 'rounded-b-xl' : ''}
                  `}
                >
                  {opt.name}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}