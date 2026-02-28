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
