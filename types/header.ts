export interface User {
  id: string;
  email: string | null | undefined;
  name: string;
  role: string;
}
export interface HeaderProps {
  user: User;
}