// ---------------------------------------------------------------------------
// Supabase generated types stub.
//
// Run `npx supabase gen types typescript --project-id vqbkmdvhvqwasvdwjdtf`
// to refresh this file. Until then, we hand-write a minimal shape that lets
// the rest of the codebase type-check against the `public` schema we created
// in the SQL migration (see docs/SUPABASE_SETUP.md).
//
// Note: we intentionally use `Record<string, unknown>`-style shapes that
// satisfy postgrest-js' GenericSchema. Action functions cast payload types
// with `as never` where the local shape is stricter than what the
// auto-generated type would produce.
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

interface GenericTable {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: GenericRelationship[];
}

export interface Database {
  public: {
    Tables: {
      profiles: GenericTable & {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          first_name: string | null;
          last_name: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      reports: GenericTable & {
        Row: {
          id: string;
          user_id: string;
          type: 'LOST' | 'FOUND';
          species: 'DOG' | 'CAT';
          name: string | null;
          status:
            | 'LOST_ACTIVE'
            | 'IN_SHELTER'
            | 'WANDERING'
            | 'FOUND_DEAD'
            | 'REUNITED';
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
        };
      };
      report_images: GenericTable & {
        Row: {
          id: string;
          report_id: string;
          storage_path: string;
          is_primary: boolean;
          created_at: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
