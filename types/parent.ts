export type Parent = {
  id_users: string;
  name: string;
  father_name: string | null;
  nik: string | null;
  kk: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  children_count: number;
  created_at: string;
  role?: string;
};

export type ParentListResponse = {
  success: boolean;
  data: Parent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
