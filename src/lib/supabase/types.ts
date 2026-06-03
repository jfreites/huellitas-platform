export type ReportType = 'LOST' | 'FOUND';
export type PetSpecies = 'DOG' | 'CAT';
export type PetStatus =
  | 'LOST_ACTIVE'
  | 'IN_SHELTER'
  | 'WANDERING'
  | 'FOUND_DEAD'
  | 'REUNITED';

export const REPORT_STATUS_LABEL: Record<PetStatus, string> = {
  LOST_ACTIVE: 'Búsqueda Activa',
  IN_SHELTER: 'En Resguardo',
  WANDERING: 'Visto Deambulando',
  FOUND_DEAD: 'Encontrado sin Vida',
  REUNITED: '¡Reunido!',
};

export const REPORT_STATUS_BADGE: Record<PetStatus, string> = {
  LOST_ACTIVE: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
  IN_SHELTER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
  WANDERING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  FOUND_DEAD: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
  REUNITED: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-900/50',
};

export interface ReportImage {
  id: string;
  storage_path: string;
  is_primary: boolean;
  publicUrl?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface Report {
  id: string;
  user_id: string;
  type: ReportType;
  species: PetSpecies;
  name: string | null;
  status: PetStatus;
  has_collar: boolean;
  has_spots: boolean;
  has_chip: boolean;
  has_scars: boolean;
  color: string | null;
  distinctive_text: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  description: string | null;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  images?: ReportImage[];
  user?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'phone'> | null;
}
