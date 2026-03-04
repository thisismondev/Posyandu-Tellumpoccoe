export type Child = {
  id: number;
  name: string;
  nik: string | null;
  gender: 'male' | 'female';
  birth: string; // date in ISO format
  age: number; // calculated from birth
  parent_name: string; // nama kepala keluarga
  father_name: string | null; // nama ayah
  heightCm: number | null; // tinggi badan (TB)
  weightKg: number | null; // berat badan (BB)
  headCm: number | null; // lingkar kepala (LK)
  child_no: number | null; // anak ke berapa
  status: string | null; // status anak
  death_date: string | null; // tanggal meninggal
  death_location: string | null; // lokasi meninggal
  death_cause: string | null; // penyebab meninggal
  move_date: string | null; // tanggal pindah
  move_destination: string | null; // pindah kemana
  created_at: string;
};

export type ChildrenResponse = {
  success: boolean;
  data: Child[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
