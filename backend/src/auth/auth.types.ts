export type RegisterDto = {
  email: string;
  name: string;
  password: string;
};

export type LoginDto = {
  email: string;
  password: string;
  userAgent?: string | null;
  ip?: string | null;
};
