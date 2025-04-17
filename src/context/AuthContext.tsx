
import React, { createContext, useContext, useState, useEffect } from "react";

// User type
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  depositCash: (amount: number) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample users for demo
const DEMO_USERS = [
  {
    id: "1",
    username: "demo",
    email: "demo@example.com",
    password: "password",
    balance: 1000,
  },
  {
    id: "2",
    username: "user2",
    email: "user2@example.com",
    password: "password",
    balance: 1500,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API request
    const foundUser = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const userExists = DEMO_USERS.some((u) => u.email === email);
    
    if (userExists) {
      return false;
    }

    // Create new user (in a real app, this would be a server call)
    const newUser = {
      id: `${DEMO_USERS.length + 1}`,
      username,
      email,
      balance: 100, // Starting balance
    };

    // Add to demo users (simulating database)
    DEMO_USERS.push({ ...newUser, password });
    
    // Log in the user
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    return true;
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };
  
  // Deposit cash function
  const depositCash = (amount: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: user.balance + amount
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update the demo user data as well
      const userIndex = DEMO_USERS.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        DEMO_USERS[userIndex].balance = updatedUser.balance;
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    depositCash
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
