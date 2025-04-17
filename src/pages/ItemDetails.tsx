
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useItems } from "@/context/ItemsContext";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionsContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShoppingCart, ArrowLeft, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ItemDetails: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const { items } = useItems();
  const { user } = useAuth();
  const { purchaseItem } = useTransactions();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPurchaseSuccess, setIsPurchaseSuccess] = useState(false);

  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-muted/40">
        <Navbar />
        <div className="container mx-auto px-4 py-10">
          <Button variant="outline" onClick={() => navigate("/marketplace")} className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
          </Button>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-6" />
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The item you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => navigate("/marketplace")}>
              Browse Marketplace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canPurchase = user && user.id !== item.sellerId && user.balance >= item.price;

  const handlePurchase = () => {
    if (!user) {
      setError("You must be logged in to purchase items");
      return;
    }

    if (user.id === item.sellerId) {
      setError("You cannot purchase your own item");
      return;
    }

    if (user.balance < item.price) {
      setError("Insufficient funds to purchase this item");
      return;
    }

    const success = purchaseItem(item.id);
    if (success) {
      setIsPurchaseSuccess(true);
    } else {
      setError("Failed to complete purchase. Please try again.");
    }
    setIsConfirmDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <Button variant="outline" onClick={() => navigate("/marketplace")} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPurchaseSuccess && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Item purchased successfully! You can view it in your dashboard.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-lg overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Seller: {item.sellerName}
                  </div>
                </div>
                <Badge className="text-lg px-3 py-1">${item.price.toFixed(2)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Listed on {formatDate(item.createdAt)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    disabled={!canPurchase || isPurchaseSuccess}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {isPurchaseSuccess ? "Purchased" : "Purchase Item"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Purchase</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to purchase this item?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                      <span className="font-medium">{item.name}</span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Your balance after purchase:</span>
                      <span>${(user ? user.balance - item.price : 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePurchase}>
                      Confirm Purchase
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
