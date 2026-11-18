import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isOnboardingCompleted,
  ONBOARDING_STORAGE_KEY,
  resetOnboarding,
  setOnboardingCompleted,
} from '../../src/storage/onboarding';

describe('Onboarding Storage', () => {
  beforeEach(async () => {
    await resetOnboarding();
  });

  it('defaults to false on fresh installation', async () => {
    const completed = await isOnboardingCompleted();
    expect(completed).toBe(false);
  });

  it('persists completion and returns true', async () => {
    await setOnboardingCompleted();

    const storedValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    expect(storedValue).toBe('true');

    const completed = await isOnboardingCompleted();
    expect(completed).toBe(true);
  });

  it('resets completion when resetOnboarding is called', async () => {
    await setOnboardingCompleted();
    expect(await isOnboardingCompleted()).toBe(true);

    await resetOnboarding();
    expect(await isOnboardingCompleted()).toBe(false);
  });

  it('handles AsyncStorage read errors gracefully with fallback', async () => {
    await resetOnboarding();

    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Storage failure'));

    const result = await isOnboardingCompleted();
    expect(result).toBe(false);
  });

  it('handles AsyncStorage write errors gracefully with in-memory fallback', async () => {
    await resetOnboarding();

    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Write failure'));

    await setOnboardingCompleted();

    // In-memory fallback ensures user is not trapped even if disk write failed
    const result = await isOnboardingCompleted();
    expect(result).toBe(true);
  });
});
