
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, DollarSign, User, CreditCard } from "lucide-react";
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

const AccountSettings: React.FC = () => {
  const { user, depositCash } = useAuth();
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleDeposit = () => {
    setDepositError("");
    setDepositSuccess(false);
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError("Please enter a valid amount greater than 0");
      return;
    }
    
    depositCash(amount);
    setDepositAmount("");
    setDepositSuccess(true);
    setIsDepositDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account details and funds</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="funds">
              <DollarSign className="h-4 w-4 mr-2" />
              Funds
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.username || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Username cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed in this demo
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Button variant="outline" disabled>
                    Change Password
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Password changes are disabled in this demo
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="funds">
            <Card>
              <CardHeader>
                <CardTitle>Account Funds</CardTitle>
                <CardDescription>
                  Manage your account balance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Current Balance</p>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-1 text-muted-foreground" />
                    <span className="text-2xl font-bold">${user?.balance.toFixed(2)}</span>
                  </div>
                </div>
                
                {depositSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                      Funds deposited successfully!
                    </AlertDescription>
                  </Alert>
                )}
                
                <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Deposit Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit Funds</DialogTitle>
                      <DialogDescription>
                        Add money to your account to purchase items
                      </DialogDescription>
                    </DialogHeader>
                    {depositError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{depositError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="depositAmount">Amount ($)</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleDeposit}>
                        Deposit
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Transaction Methods</h3>
                  <p className="text-muted-foreground mb-4">
                    In a real application, you would have options to add and manage payment methods here.
                  </p>
                  <Button variant="outline" disabled>
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;
