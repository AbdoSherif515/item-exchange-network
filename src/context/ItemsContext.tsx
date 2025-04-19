
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Item type matching database schema
export interface Item {
  product_id: number;
  name: string;
  description: string;
  price: number;
  on_sale: boolean;
  creator_id: number;
}

// Items context type
interface ItemsContextType {
  items: Item[];
  myItems: Item[];
  purchasedItems: Item[];
  soldItems: Item[];
  addItem: (item: Omit<Item, "product_id" | "creator_id">) => void;
  updateItem: (id: number, updates: Partial<Item>) => void;
  removeItem: (id: number) => void;
  purchaseItem: (id: number) => boolean;
}

// Sample items matching schema
const DEMO_ITEMS: Item[] = [
  {
    product_id: 1,
    name: "Smartphone",
    description: "Latest model smartphone with high-end features",
    price: 500,
    on_sale: true,
    creator_id: 2
  },
  {
    product_id: 2,
    name: "Laptop",
    description: "Professional laptop for work and gaming",
    price: 1200,
    on_sale: true,
    creator_id: 2
  },
  {
    product_id: 3,
    name: "Headphones",
    description: "Noise-cancelling wireless headphones",
    price: 150,
    on_sale: true,
    creator_id: 1
  }
];

// Create context
const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Transactions record type matching schema
interface Transaction {
  buyer_id: number;
  product_id: number;
  date_time: number;
}

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Initialize items from demo data
  useEffect(() => {
    const savedItems = localStorage.getItem("items");
    const savedTransactions = localStorage.getItem("transactions");
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(DEMO_ITEMS);
      localStorage.setItem("items", JSON.stringify(DEMO_ITEMS));
    }
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Filter items by current user
  const myItems = items.filter(item => user && item.creator_id === user.account_id);
  
  // Get purchased items
  const purchasedItems = items.filter(item => {
    return transactions.some(t => t.product_id === item.product_id && t.buyer_id === user?.account_id);
  });
  
  // Get sold items
  const soldItems = items.filter(item => {
    return transactions.some(t => t.product_id === item.product_id && item.creator_id === user?.account_id);
  });

  // Add new item
  const addItem = (item: Omit<Item, "product_id" | "creator_id">) => {
    if (!user) return;
    
    const newItem: Item = {
      ...item,
      product_id: Date.now(),
      creator_id: user.account_id,
      on_sale: true
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Update item
  const updateItem = (id: number, updates: Partial<Item>) => {
    const updatedItems = items.map(item => {
      if (item.product_id === id && user && item.creator_id === user.account_id) {
        return { ...item, ...updates };
      }
      return item;
    });
    
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Remove item
  const removeItem = (id: number) => {
    const updatedItems = items.filter(item => {
      if (item.product_id === id) {
        return user && item.creator_id !== user.account_id;
      }
      return true;
    });
    
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Purchase item
  const purchaseItem = (id: number): boolean => {
    if (!user) return false;
    
    const itemToPurchase = items.find(item => item.product_id === id);
    
    if (!itemToPurchase || itemToPurchase.creator_id === user.account_id || !itemToPurchase.on_sale) {
      return false;
    }
    
    return true;
  };

  const value = {
    items,
    myItems,
    purchasedItems,
    soldItems,
    addItem,
    updateItem,
    removeItem,
    purchaseItem
  };

  return <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>;
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return context;
};
