import { User } from '../types';

export const authService = {
  getCurrentUser: (): User | null => {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },
  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return null;
    if (!user.isConfirmed) throw new Error("errorAccountNotConfirmed");
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  register: (data: Omit<User, 'isConfirmed' | 'profilePicture'>): User => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.some(u => u.username === data.username)) {
      throw new Error("errorUserExists");
    }
    if (users.some(u => u.email === data.email)) {
      throw new Error("errorEmailExists");
    }
    const newUser: User = { ...data, isConfirmed: false, profilePicture: null };
    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    return newUser;
  },
  logout: () => {
    sessionStorage.removeItem('currentUser');
  },
  confirmUser: (username: string): boolean => {
      const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex > -1) {
          users[userIndex].isConfirmed = true;
          localStorage.setItem('app_users', JSON.stringify(users));
          return true;
      }
      return false;
  },
  updateUser: (username: string, data: Partial<User>): User => {
      const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex === -1) throw new Error("User not found.");
      
      const updatedUser = { ...users[userIndex], ...data };
      users[userIndex] = updatedUser;
      
      localStorage.setItem('app_users', JSON.stringify(users));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
  }
};