import { User } from '../types';

// This is a helper function to decode JWTs without needing a full library.
// It's safe for this use case because we get the token directly from Google's script,
// so we can trust its integrity without verifying the signature on the client.
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT", e);
        return null;
    }
}


export const authService = {
  getCurrentUser: (): User | null => {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  login: (username: string, password: string): User | null => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find(u => u.username === username && u.password === password && u.authProvider === 'manual');
    if (!user) return null;
    if (!user.isConfirmed) throw new Error("errorAccountNotConfirmed");
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  loginWithGoogle: (credential: string): User => {
    const payload = decodeJwt(credential);
    if (!payload) {
        throw new Error('Invalid Google credential');
    }

    const { email, name, picture } = payload;
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    let user = users.find(u => u.email === email);
    
    if (user) {
        // User exists, update their info from Google and log them in
        user.fullName = name;
        user.profilePicture = picture;
        // Ensure authProvider is set to google if they first signed up manually
        user.authProvider = 'google'; 
    } else {
        // New user, create an account for them
        user = {
            username: email, // Use email as username for simplicity
            email: email,
            fullName: name,
            profilePicture: picture,
            authProvider: 'google',
            isConfirmed: true, // Google accounts are considered confirmed
            phone: '',
            isPro: false,
        };
        users.push(user);
    }
    
    localStorage.setItem('app_users', JSON.stringify(users));
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  register: (data: Omit<User, 'isConfirmed' | 'profilePicture' | 'authProvider' | 'isPro'>): User => {
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.some(u => u.username === data.username)) {
      throw new Error("errorUserExists");
    }
    if (users.some(u => u.email === data.email)) {
      throw new Error("errorEmailExists");
    }
    const newUser: User = { ...data, isConfirmed: false, profilePicture: null, authProvider: 'manual', isPro: false };
    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    return newUser;
  },
  
  logout: () => {
    sessionStorage.removeItem('currentUser');
    // Also sign out from Google if they used it
    if (typeof window.google !== 'undefined' && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
    }
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