import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_STORAGE_KEY = '@garuda:onboarding:v1';

// In-memory fallback so AsyncStorage errors never trap the user or block the app
let inMemoryCompleted: boolean | null = null;

/**
 * Returns whether the user has previously completed or skipped the first-run onboarding.
 * Defaults to false on a fresh installation.
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  if (inMemoryCompleted === true) {
    return true;
  }

  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw === 'true') {
      inMemoryCompleted = true;
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to read onboarding status from AsyncStorage:', error);
    // Safe fallback: return in-memory state if available, otherwise default to false
    return inMemoryCompleted ?? false;
  }
}

/**
 * Marks onboarding as completed in both AsyncStorage and in-memory fallback.
 * Safe against repeated calls and storage write failures.
 */
export async function setOnboardingCompleted(): Promise<void> {
  inMemoryCompleted = true;

  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch (error) {
    console.warn('Failed to persist onboarding status to AsyncStorage:', error);
    // User is still safe because inMemoryCompleted is true for the current session
  }
}

/**
 * Resets the onboarding status (useful for development, settings, or automated testing).
 */
export async function resetOnboarding(): Promise<void> {
  inMemoryCompleted = false;

  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to reset onboarding status in AsyncStorage:', error);
  }
}
