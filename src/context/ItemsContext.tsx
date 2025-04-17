
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Item type
export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  sellerId: string;
  sellerName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Items context type
interface ItemsContextType {
  items: Item[];
  myItems: Item[];
  purchasedItems: Item[];
  soldItems: Item[];
  addItem: (item: Omit<Item, "id" | "sellerId" | "sellerName" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  purchaseItem: (id: string) => boolean;
}

// Sample items
const DEMO_ITEMS: Item[] = [
  {
    id: "1",
    name: "Smartphone",
    description: "Latest model smartphone with high-end features",
    price: 500,
    sellerId: "2",
    sellerName: "user2",
    image: "https://placehold.co/300x200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Laptop",
    description: "Professional laptop for work and gaming",
    price: 1200,
    sellerId: "2",
    sellerName: "user2",
    image: "https://placehold.co/300x200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    name: "Headphones",
    description: "Noise-cancelling wireless headphones",
    price: 150,
    sellerId: "1",
    sellerName: "demo",
    image: "https://placehold.co/300x200",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create context
const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

// Transactions record for purchases
interface Transaction {
  id: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
  price: number;
  date: string;
}

const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  const myItems = items.filter(item => user && item.sellerId === user.id);
  
  // Get purchased items
  const purchasedItems = items.filter(item => {
    return transactions.some(t => t.itemId === item.id && t.buyerId === user?.id);
  });
  
  // Get sold items
  const soldItems = items.filter(item => {
    return transactions.some(t => t.itemId === item.id && t.sellerId === user?.id);
  });

  // Add new item
  const addItem = (item: Omit<Item, "id" | "sellerId" | "sellerName" | "createdAt" | "updatedAt">) => {
    if (!user) return;
    
    const newItem: Item = {
      ...item,
      id: `${Date.now()}`,
      sellerId: user.id,
      sellerName: user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Update item
  const updateItem = (id: string, updates: Partial<Item>) => {
    const updatedItems = items.map(item => {
      if (item.id === id && user && item.sellerId === user.id) {
        return { 
          ...item, 
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Remove item
  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => {
      // Only allow deletion if user owns the item
      if (item.id === id) {
        return user && item.sellerId !== user.id;
      }
      return true;
    });
    
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  // Purchase item
  const purchaseItem = (id: string): boolean => {
    if (!user) return false;
    
    const itemToPurchase = items.find(item => item.id === id);
    
    // Check if item exists and is not owned by user
    if (!itemToPurchase || itemToPurchase.sellerId === user.id) {
      return false;
    }
    
    // This function will be called from TransactionsContext
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

const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error("useItems must be used within an ItemsProvider");
  }
  return context;
};

export { ItemsProvider, useItems };
