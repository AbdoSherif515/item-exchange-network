
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { 
  ShoppingBag, 
  UserPlus, 
  LogIn, 
  ShoppingCart, 
  BarChart, 
  CreditCard,
  PackageCheck,
  Search
} from "lucide-react";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Item Exchange Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Buy, sell, and exchange items with other users in a simple, 
            secure marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button size="lg" onClick={() => navigate("/marketplace")}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Marketplace
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/items")}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Manage My Items
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/register")}>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <UserPlus className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">User Accounts</h3>
              <p className="text-muted-foreground">Create your account and start buying or selling items immediately</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sell Items</h3>
              <p className="text-muted-foreground">List your items for sale with custom descriptions and pricing</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Search & Browse</h3>
              <p className="text-muted-foreground">Find items for sale by other users with powerful search options</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">Deposit funds and make secure purchases between accounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <UserPlus className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">1. Create Account</h3>
              <p className="text-muted-foreground">Sign up for a free account to start buying and selling</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">2. Add Funds</h3>
              <p className="text-muted-foreground">Deposit money to your account for purchasing items</p>
            </div>
            
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <PackageCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-medium mb-2">3. Buy & Sell</h3>
              <p className="text-muted-foreground">List items for sale or purchase from other users</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => navigate(isAuthenticated ? "/marketplace" : "/register")}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start trading?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join our marketplace today and connect with buyers and sellers from everywhere
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
          >
            {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center text-xl font-bold">
                <ShoppingCart className="h-6 w-6 mr-2" />
                <span>ItemExchange</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">The simple way to buy and sell</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} ItemExchange Network. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
