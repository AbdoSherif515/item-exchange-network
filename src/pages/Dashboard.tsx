
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useItems } from "@/context/ItemsContext";
import { useTransactions } from "@/context/TransactionsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  Package,
  BarChart,
  PlusCircle,
  ShoppingCart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard: React.FC = () => {
  const { user, depositCash } = useAuth();
  const { myItems, purchasedItems, soldItems } = useItems();
  const { getTotalSales, getTotalPurchases } = useTransactions();
  const [amount, setAmount] = React.useState<string>("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return;
    }

    depositCash(depositAmount);
    setAmount("");
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h1>
          <p className="text-muted-foreground">Manage your items and transactions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${user?.balance.toFixed(2)}</div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Deposit Cash
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Cash</DialogTitle>
                    <DialogDescription>
                      Add funds to your account to purchase items.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleDeposit}>Deposit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Listed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{myItems.length}</div>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <Link to="/items">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Manage Items
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{soldItems.length}</div>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Revenue: ${getTotalSales().toFixed(2)}
              </div>
              <Link to="/reports">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{purchasedItems.length}</div>
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Spent: ${getTotalPurchases().toFixed(2)}
              </div>
              <Link to="/marketplace">
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Your recently purchased items</CardDescription>
            </CardHeader>
            <CardContent>
              {purchasedItems.length > 0 ? (
                <div className="space-y-4">
                  {purchasedItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <PackageCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)} • From: {item.sellerName}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You haven't purchased any items yet</p>
                  <Link to="/marketplace">
                    <Button>Browse Marketplace</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Listed Items</CardTitle>
              <CardDescription>Items you currently have for sale</CardDescription>
            </CardHeader>
            <CardContent>
              {myItems.length > 0 ? (
                <div className="space-y-4">
                  {myItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">You don't have any items listed</p>
                  <Link to="/items">
                    <Button>Add New Item</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
