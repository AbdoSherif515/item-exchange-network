
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useItems } from "./ItemsContext";

// Transaction type matching database schema
export interface Transaction {
  buyer_id: number;
  product_id: number;
  date_time: number;
  amount: number;
}

// Transactions context type
interface TransactionsContextType {
  transactions: Transaction[];
  myPurchases: Transaction[];
  mySales: Transaction[];
  purchaseItem: (itemId: number) => boolean;
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
  const myPurchases = transactions.filter(t => user && t.buyer_id === user.account_id);
  const mySales = transactions.filter(t => {
    const item = items.find(i => i.product_id === t.product_id);
    return user && item && item.creator_id === user.account_id;
  });

  // Purchase item function
  const purchaseItem = (itemId: number): boolean => {
    if (!user) return false;
    
    const item = items.find(i => i.product_id === itemId);
    
    if (!item || item.creator_id === user.account_id || !item.on_sale) {
      console.error("Item not available for purchase");
      return false;
    }
    
    if (user.balance < item.price) {
      console.error("Insufficient funds");
      return false;
    }
    
    // Create transaction
    const transaction: Transaction = {
      buyer_id: user.account_id,
      product_id: item.product_id,
      date_time: Date.now(),
      amount: item.price
    };
    
    // Update transactions
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    
    // Update user balance (deduct purchase amount)
    depositCash(-item.price);
    
    return true;
  };

  // Get total sales amount
  const getTotalSales = (): number => {
    return mySales.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Get total purchases amount
  const getTotalPurchases = (): number => {
    return myPurchases.reduce((sum, transaction) => sum + transaction.amount, 0);
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
