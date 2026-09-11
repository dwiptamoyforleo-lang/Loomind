import { Notebook, ResearchSource, ChatMessage, StudioSavedItem, UserProfile } from '../types';
import { DEFAULT_USERS, getInitialUserData } from '../data/seedData';

const CURRENT_USER_KEY = 'noesis_auth_current_user_id';

export function getSavedCurrentUserId(): string {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved && DEFAULT_USERS.some((u) => u.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return DEFAULT_USERS[0].id;
}

export function saveCurrentUserId(userId: string) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (e) {
    console.warn('Failed to save current user id:', e);
  }
}

// User-scoped storage keys
function userKey(userId: string, subkey: string): string {
  return `noesis_${userId}_${subkey}`;
}

export interface UserWorkspaceState {
  notebooks: Notebook[];
  sources: ResearchSource[];
  messages: ChatMessage[];
  savedItems: StudioSavedItem[];
}

export function loadUserWorkspace(userId: string): UserWorkspaceState {
  try {
    const rawNb = localStorage.getItem(userKey(userId, 'notebooks'));
    const rawSrc = localStorage.getItem(userKey(userId, 'sources'));
    const rawMsg = localStorage.getItem(userKey(userId, 'messages'));
    const rawSaved = localStorage.getItem(userKey(userId, 'savedItems'));

    if (rawNb && rawSrc) {
      return {
        notebooks: JSON.parse(rawNb),
        sources: JSON.parse(rawSrc),
        messages: rawMsg ? JSON.parse(rawMsg) : [],
        savedItems: rawSaved ? JSON.parse(rawSaved) : [],
      };
    }
  } catch (e) {
    console.error('Error reading localStorage for user:', userId, e);
  }

  // Generate clean initial seed data for this user
  const initial = getInitialUserData(userId);
  saveUserWorkspace(userId, initial);
  return initial;
}

export function saveUserWorkspace(userId: string, state: UserWorkspaceState) {
  try {
    localStorage.setItem(userKey(userId, 'notebooks'), JSON.stringify(state.notebooks));
    localStorage.setItem(userKey(userId, 'sources'), JSON.stringify(state.sources));
    localStorage.setItem(userKey(userId, 'messages'), JSON.stringify(state.messages));
    localStorage.setItem(userKey(userId, 'savedItems'), JSON.stringify(state.savedItems));
  } catch (e) {
    console.warn('Failed to save user state to localStorage:', e);
  }
}

export function clearUserData(userId: string) {
  try {
    localStorage.removeItem(userKey(userId, 'notebooks'));
    localStorage.removeItem(userKey(userId, 'sources'));
    localStorage.removeItem(userKey(userId, 'messages'));
    localStorage.removeItem(userKey(userId, 'savedItems'));
  } catch (e) {
    console.warn('Failed to clear user data:', e);
  }
}
