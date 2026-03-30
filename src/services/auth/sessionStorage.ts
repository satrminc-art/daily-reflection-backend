import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "daytri:access-token";
const REFRESH_TOKEN_KEY = "daytri:refresh-token";
const EXPIRES_AT_KEY = "daytri:auth-expires-at";
const USER_ID_KEY = "daytri:auth-user-id";
const USER_EMAIL_KEY = "daytri:auth-user-email";

export async function saveSessionTokens(input: {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: { id: string; email: string | null };
}) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, input.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, input.refreshToken),
    SecureStore.setItemAsync(EXPIRES_AT_KEY, input.expiresAt),
    SecureStore.setItemAsync(USER_ID_KEY, input.user.id),
    SecureStore.setItemAsync(USER_EMAIL_KEY, input.user.email ?? ""),
  ]);
}

export async function loadSessionTokens() {
  const [accessToken, refreshToken, expiresAt, userId, userEmail] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(EXPIRES_AT_KEY),
    SecureStore.getItemAsync(USER_ID_KEY),
    SecureStore.getItemAsync(USER_EMAIL_KEY),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresAt,
    userId,
    userEmail,
  };
}

export async function clearSessionTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY),
    SecureStore.deleteItemAsync(USER_ID_KEY),
    SecureStore.deleteItemAsync(USER_EMAIL_KEY),
  ]);
}
