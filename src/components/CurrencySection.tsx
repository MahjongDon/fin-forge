
import { useState, useEffect } from "react";
import { ArrowLeftRight, Check, Clock, CornerDownLeft, History, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample popular currencies
const popularCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
];

interface ConversionHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  date: Date;
  rate: number;
}

interface ExchangeRates {
  [key: string]: number;
}

export default function CurrencySection() {
  const [fromCurrency, setFromCurrency] = useState(() => {
    return localStorage.getItem('fromCurrency') || "USD";
  });
  
  const [toCurrency, setToCurrency] = useState(() => {
    return localStorage.getItem('toCurrency') || "EUR";
  });
  
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [rate, setRate] = useState(0);
  const [history, setHistory] = useState<ConversionHistory[]>(() => {
    const saved = localStorage.getItem('conversionHistory');
    return saved ? JSON.parse(saved).map((item: any) => ({
      ...item,
      date: new Date(item.date)
    })) : [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultCurrency, setDefaultCurrency] = useState(() => {
    return localStorage.getItem('defaultCurrency') || "USD";
  });

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      
      try {
        // This would use the actual API in a real app
        // In this demo we'll simulate the response
        setTimeout(() => {
          // Simulate API response with some realistic rates
          const rates: ExchangeRates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            JPY: 149.51,
            CAD: 1.35,
            AUD: 1.51,
            CNY: 7.19,
            INR: 83.10,
            CHF: 0.87,
            NZD: 1.62,
            SGD: 1.34,
            HKD: 7.81,
            SEK: 10.41,
            KRW: 1335.67,
            MXN: 16.73,
            BRL: 5.04
          };
          
          setExchangeRates(rates);
          setLastUpdated(new Date());
          setIsLoading(false);
          
          // Calculate conversion based on new rates
          if (rates[toCurrency] && rates[fromCurrency]) {
            const rate = rates[toCurrency] / rates[fromCurrency];
            setRate(rate);
            setConvertedAmount(amount * rate);
          }
        }, 1200); // Simulate API delay
      } catch (error) {
        console.error("Error fetching rates:", error);
        setIsLoading(false);
        toast.error("Failed to fetch exchange rates");
      }
    };

    fetchRates();
  }, [fromCurrency, toCurrency, amount]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('fromCurrency', fromCurrency);
    localStorage.setItem('toCurrency', toCurrency);
    localStorage.setItem('defaultCurrency', defaultCurrency);
    localStorage.setItem('conversionHistory', JSON.stringify(history));
  }, [fromCurrency, toCurrency, defaultCurrency, history]);

  // Handle amount change
  const handleAmountChange = (value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setAmount(parsed);
      if (rate) {
        setConvertedAmount(parsed * rate);
      }
    } else if (value === "") {
      setAmount(0);
      setConvertedAmount(0);
    }
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Add to history
  const handleAddToHistory = () => {
    if (amount && convertedAmount) {
      const newEntry: ConversionHistory = {
        id: crypto.randomUUID(),
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount: convertedAmount,
        date: new Date(),
        rate
      };
      
      setHistory([newEntry, ...history].slice(0, 20)); // Keep only 20 entries
      toast.success("Conversion saved to history");
    }
  };

  // Set as default currency
  const handleSetDefault = (currency: string) => {
    setDefaultCurrency(currency);
    toast.success(`${currency} set as your default currency`);
  };

  // Filter currencies based on search
  const filteredCurrencies = popularCurrencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Currency Converter</h1>
          <p className="text-muted-foreground">Convert between currencies using real-time exchange rates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              // Simulate refresh
              setTimeout(() => {
                setLastUpdated(new Date());
                setIsLoading(false);
                toast.success("Exchange rates updated");
              }, 1500);
            }}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh Rates
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="finance-card">
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
            <CardDescription>Convert between currencies with real-time exchange rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* From currency */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {popularCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount || ''}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                </div>
              </div>
              
              {/* Swap button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapCurrencies}
                  className="rounded-full h-10 w-10"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* To currency */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {popularCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/2">
                    <Input
                      readOnly
                      value={convertedAmount ? convertedAmount.toFixed(4) : '0'}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
              
              {/* Conversion rate info */}
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">1 {fromCurrency}</span> = <span className="font-medium text-foreground">{rate.toFixed(4)} {toCurrency}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Updating...'}
                </p>
              </div>
              
              <Button 
                className="w-full"
                onClick={handleAddToHistory}
                disabled={isLoading || amount <= 0}
              >
                <CornerDownLeft className="mr-2 h-4 w-4" />
                Save to History
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="finance-card">
          <Tabs defaultValue="popular">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Currencies</CardTitle>
                <TabsList>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>Browse currencies and conversion history</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="popular" className="mt-0">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search currencies..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[380px] overflow-y-auto subtle-scroll pr-2">
                  {filteredCurrencies.map((currency) => (
                    <div
                      key={currency.code}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-muted-foreground">{currency.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {exchangeRates[currency.code] ? (
                            <>
                              {exchangeRates[currency.code] === 1 ? (
                                "Base"
                              ) : (
                                `${(exchangeRates[currency.code] || 0).toFixed(4)}`
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => handleSetDefault(currency.code)}
                        >
                          {defaultCurrency === currency.code ? (
                            <div className="flex items-center gap-1 text-finance-green">
                              <Check className="h-3 w-3" />
                              <span className="text-xs">Default</span>
                            </div>
                          ) : (
                            <span className="text-xs">Set default</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredCurrencies.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No currencies match your search.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <div className="space-y-4 max-h-[420px] overflow-y-auto subtle-scroll pr-2">
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}, {new Date(entry.date).toLocaleTimeString()}
                          </div>
                          <div className="text-xs font-medium bg-finance-indigo/10 text-finance-indigo px-2 py-0.5 rounded-full">
                            Rate: {entry.rate.toFixed(4)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {entry.fromAmount.toFixed(2)} {entry.fromCurrency}
                          </div>
                          <ArrowLeftRight className="h-4 w-4 text-muted-foreground mx-2" />
                          <div className="font-medium">
                            {entry.toAmount.toFixed(2)} {entry.toCurrency}
                          </div>
                        </div>
                        <div className="flex mt-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-8"
                            onClick={() => {
                              setFromCurrency(entry.fromCurrency);
                              setToCurrency(entry.toCurrency);
                              setAmount(entry.fromAmount);
                            }}
                          >
                            Reuse
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs h-8"
                            onClick={() => {
                              setFromCurrency(entry.toCurrency);
                              setToCurrency(entry.fromCurrency);
                              setAmount(entry.toAmount);
                            }}
                          >
                            Reverse
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Your conversion history will appear here.</p>
                      <p className="text-xs text-muted-foreground mt-1">Save conversions to view them later.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <Card className="finance-card">
        <CardHeader>
          <CardTitle>Exchange Rate Information</CardTitle>
          <CardDescription>Important details about currency conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Exchange rates are updated periodically throughout the day. The rates provided are for informational purposes only and should not be used for actual financial transactions.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Your Default Currency</h3>
                <p className="text-lg font-bold">{defaultCurrency}</p>
                <p className="text-xs text-muted-foreground mt-1">Used as the base for calculations</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Available Currencies</h3>
                <p className="text-lg font-bold">{popularCurrencies.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Major world currencies supported</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Last Updated</h3>
                <p className="text-lg font-bold">
                  {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Updating...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Refresh to get the latest rates</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 mt-6">
              <h3 className="text-sm font-medium mb-2">Using This Tool</h3>
              <p className="text-sm text-muted-foreground">
                This currency converter can help you understand the relative value of different currencies. Simply enter an amount, select the currencies you want to convert between, and get an instant result.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                For actual financial transactions, please consult your bank or a financial advisor as exchange rates may include additional fees and may differ from the mid-market rates shown here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
