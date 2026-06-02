/**
 * Unit type for stock measurement units.
 */
export interface Unit {
  id: number;
  name?: string;
  abbreviation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUnitRequest {
  name: string;
  abbreviation: string;
}

export interface UpdateUnitRequest {
  name?: string;
  abbreviation?: string;
}
