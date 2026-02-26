
import { InterviewSession, UserProfile, AuthUser } from '../types';

const KEYS = {
  SESSIONS: 'interview_ai_sessions',
  PROFILE: 'interview_ai_profile',
  THEME: 'interview_ai_theme',
  USER: 'interview_ai_auth_user',
  REGISTERED_USERS: 'interview_ai_db_users',
  LAST_IDENTIFIER: 'interview_ai_last_id'
};

export const storageService = {
  saveSession: (session: InterviewSession) => {
    const sessions = storageService.getSessions();
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify([session, ...sessions]));
  },

  getSessions: (): InterviewSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveTheme: (themeId: string) => {
    localStorage.setItem(KEYS.THEME, themeId);
  },

  getTheme: (): string | null => {
    return localStorage.getItem(KEYS.THEME);
  },

  saveUser: (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      localStorage.setItem(KEYS.LAST_IDENTIFIER, user.email);
    } else {
      localStorage.removeItem(KEYS.USER);
    }
  },

  getUser: (): AuthUser | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  isIdentifierAvailable: (identifier: string): boolean => {
    const users = storageService.getRegisteredUsers();
    return !users.some(u => u.email === identifier || u.phone === identifier);
  },

  // Auth Database Simulation
  registerUser: (userData: { email: string; phone: string; password?: string; name: string }): any | null => {
    const users = storageService.getRegisteredUsers();
    
    if (users.find(u => u.email === userData.email)) return null;
    if (users.find(u => u.phone === userData.phone)) return null;

    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&color=fff&bold=true`
    };

    users.push(newUser);
    localStorage.setItem(KEYS.REGISTERED_USERS, JSON.stringify(users));
    return newUser;
  },

  login: (identifier: string, password?: string): any | null => {
    const users = storageService.getRegisteredUsers();
    return users.find(u => 
      (u.email === identifier || u.phone === identifier) && u.password === password
    ) || null;
  },

  getRegisteredUsers: (): any[] => {
    const data = localStorage.getItem(KEYS.REGISTERED_USERS);
    return data ? JSON.parse(data) : [];
  }
};
