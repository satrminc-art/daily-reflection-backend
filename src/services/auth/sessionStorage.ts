import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "daytri.access_token";
const REFRESH_TOKEN_KEY = "daytri.refresh_token";
const EXPIRES_AT_KEY = "daytri.auth_expires_at";
const USER_ID_KEY = "daytri.auth_user_id";
const USER_EMAIL_KEY = "daytri.auth_user_email";

const LEGACY_ACCESS_TOKEN_KEY = "daytri:access-token";
const LEGACY_REFRESH_TOKEN_KEY = "daytri:refresh-token";
const LEGACY_EXPIRES_AT_KEY = "daytri:auth-expires-at";
const LEGACY_USER_ID_KEY = "daytri:auth-user-id";
const LEGACY_USER_EMAIL_KEY = "daytri:auth-user-email";

async function migrateSecureValue(nextKey: string, legacyKey: string) {
  const currentValue = await SecureStore.getItemAsync(nextKey);
  if (currentValue !== null) {
    return currentValue;
  }

  const legacyValue = await SecureStore.getItemAsync(legacyKey);
  if (legacyValue === null) {
    return null;
  }

  await SecureStore.setItemAsync(nextKey, legacyValue);
  await SecureStore.deleteItemAsync(legacyKey);
  return legacyValue;
}

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
    migrateSecureValue(ACCESS_TOKEN_KEY, LEGACY_ACCESS_TOKEN_KEY),
    migrateSecureValue(REFRESH_TOKEN_KEY, LEGACY_REFRESH_TOKEN_KEY),
    migrateSecureValue(EXPIRES_AT_KEY, LEGACY_EXPIRES_AT_KEY),
    migrateSecureValue(USER_ID_KEY, LEGACY_USER_ID_KEY),
    migrateSecureValue(USER_EMAIL_KEY, LEGACY_USER_EMAIL_KEY),
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
    SecureStore.deleteItemAsync(LEGACY_ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(LEGACY_REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(LEGACY_EXPIRES_AT_KEY),
    SecureStore.deleteItemAsync(LEGACY_USER_ID_KEY),
    SecureStore.deleteItemAsync(LEGACY_USER_EMAIL_KEY),
  ]);
}
