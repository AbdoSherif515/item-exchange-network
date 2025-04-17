
import React, { useState } from "react";
import { useTransactions } from "@/context/TransactionsContext";
import { useItems } from "@/context/ItemsContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  ShoppingCart,
  ShoppingBag,
  Calendar,
  Download,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Reports: React.FC = () => {
  const { transactions, myPurchases, mySales, getTotalSales, getTotalPurchases } = useTransactions();
  const { soldItems, purchasedItems } = useItems();
  const [timeRange, setTimeRange] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter transactions by time range
  const getFilteredTransactions = (transactions: any[]) => {
    if (timeRange === "all") return transactions;
    
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };

  // Sort transactions by date
  const sortTransactions = (transactions: any[]) => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  };
  
  const filteredPurchases = getFilteredTransactions(myPurchases);
  const filteredSales = getFilteredTransactions(mySales);
  
  const sortedPurchases = sortTransactions(filteredPurchases);
  const sortedSales = sortTransactions(filteredSales);

  // Calculate totals
  const purchaseTotal = filteredPurchases.reduce((sum, t) => sum + t.price, 0);
  const salesTotal = filteredSales.reduce((sum, t) => sum + t.price, 0);
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };
  
  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View your transaction history and statistics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${getTotalPurchases().toFixed(2)}</div>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {purchasedItems.length} items purchased
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${getTotalSales().toFixed(2)}</div>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {soldItems.length} items sold
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${(getTotalSales() - getTotalPurchases()).toFixed(2)}</div>
                {getTotalSales() - getTotalPurchases() >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Difference between sales and purchases
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" size="sm" onClick={toggleSortOrder}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </Button>
        </div>
        
        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="purchases">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchases
            </TabsTrigger>
            <TabsTrigger value="sales">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Sales
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Purchase History</CardTitle>
                  <div>
                    <div className="text-sm font-medium">Total: ${purchaseTotal.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {filteredPurchases.length} transactions
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedPurchases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPurchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>{formatDate(purchase.date)}</TableCell>
                          <TableCell className="font-medium">{purchase.itemName}</TableCell>
                          <TableCell>{purchase.sellerName}</TableCell>
                          <TableCell className="text-right">${purchase.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                    <p>No purchase transactions found for this time period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sales History</CardTitle>
                  <div>
                    <div className="text-sm font-medium">Total: ${salesTotal.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {filteredSales.length} transactions
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedSales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell className="font-medium">{sale.itemName}</TableCell>
                          <TableCell>{sale.buyerName}</TableCell>
                          <TableCell className="text-right">${sale.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                    <p>No sales transactions found for this time period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-8">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
