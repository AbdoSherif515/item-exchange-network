
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useItems, Item } from "./ItemsContext";

// Transaction type
export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  price: number;
  date: string;
}

// Transactions context type
interface TransactionsContextType {
  transactions: Transaction[];
  myPurchases: Transaction[];
  mySales: Transaction[];
  purchaseItem: (itemId: string) => boolean;
  getTotalSales: () => number;
  getTotalPurchases: () => number;
}

// Create context
const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

// Provider component
export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, depositCash } = useAuth();
  const { items } = useItems();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load saved transactions
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Filter transactions for current user
  const myPurchases = transactions.filter(t => user && t.buyerId === user.id);
  const mySales = transactions.filter(t => user && t.sellerId === user.id);

  // Purchase item function
  const purchaseItem = (itemId: string): boolean => {
    if (!user) return false;
    
    const item = items.find(i => i.id === itemId);
    
    // Validate item exists and is not owned by the user
    if (!item || item.sellerId === user.id) {
      console.error("Item not available for purchase");
      return false;
    }
    
    // Check if user has enough balance
    if (user.balance < item.price) {
      console.error("Insufficient funds");
      return false;
    }
    
    // Create transaction
    const transaction: Transaction = {
      id: `${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      buyerId: user.id,
      buyerName: user.username,
      price: item.price,
      date: new Date().toISOString()
    };
    
    // Update transactions
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    
    // Update user balance (deduct purchase amount)
    depositCash(-item.price);
    
    // In a real app, we would update the seller's balance here through an API call
    
    return true;
  };

  // Get total sales amount
  const getTotalSales = (): number => {
    return mySales.reduce((sum, transaction) => sum + transaction.price, 0);
  };

  // Get total purchases amount
  const getTotalPurchases = (): number => {
    return myPurchases.reduce((sum, transaction) => sum + transaction.price, 0);
  };

  const value = {
    transactions,
    myPurchases,
    mySales,
    purchaseItem,
    getTotalSales,
    getTotalPurchases
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider");
  }
  return context;
};
