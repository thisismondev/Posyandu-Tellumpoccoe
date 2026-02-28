export type Measurement = {
  id: number;
  children_id: number;
  measured_at: string; // tanggal pengukuran
  child_name: string;
  child_birth: string;
  age_months: number; // usia dalam bulan
  heightCm: number | null; // TB
  weightKg: number | null; // BB
  headCm: number | null; // LK
  armCm: number | null; // LILA
};

export type MeasurementsResponse = {
  success: boolean;
  data: Measurement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
