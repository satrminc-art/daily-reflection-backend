export type AuthStatus = "loading" | "guest" | "authenticated";

export interface AppAuthUser {
  id: string;
  email: string | null;
}

export interface AppAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AppAuthUser;
}
