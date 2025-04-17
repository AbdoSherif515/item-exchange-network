
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Store, Package, BarChart, User, LogOut, ShoppingCart } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold text-primary flex items-center">
            <ShoppingCart className="h-6 w-6 mr-2" />
            <span>ItemExchange</span>
          </Link>
        </div>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center">
            <Home className="h-4 w-4 mr-1" />
            <span>Home</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/marketplace" className="text-foreground hover:text-primary transition-colors flex items-center">
                <Store className="h-4 w-4 mr-1" />
                <span>Marketplace</span>
              </Link>
              <Link to="/items" className="text-foreground hover:text-primary transition-colors flex items-center">
                <Package className="h-4 w-4 mr-1" />
                <span>My Items</span>
              </Link>
              <Link to="/reports" className="text-foreground hover:text-primary transition-colors flex items-center">
                <BarChart className="h-4 w-4 mr-1" />
                <span>Reports</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                Balance: ${user?.balance.toFixed(2)}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
