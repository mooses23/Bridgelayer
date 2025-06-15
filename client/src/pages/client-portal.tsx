import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Eye, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load Stripe with public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface ClientAuth {
  clientId: number;
  firmId: number;
  email: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  clientId: number;
  description?: string;
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  processedAt: string;
  paymentMethod?: string;
  invoiceId: number;
}

// Payment form component
const PaymentForm = ({ invoice, onSuccess }: { invoice: Invoice; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/client-portal?payment=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Submitted",
          description: "Your payment is being processed. You will receive a confirmation shortly.",
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Invoice #{invoice.invoiceNumber}</span>
          <span className="text-2xl font-bold">${(invoice.amount / 100).toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600">{invoice.description || "Legal services"}</p>
      </div>

      <PaymentElement />

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay $${(invoice.amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

// Client portal login component
const ClientLogin = ({ onLogin }: { onLogin: (auth: ClientAuth) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loginMethod, setLoginMethod] = useState<"credentials" | "token">("credentials");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { email?: string; password?: string; token?: string }) => {
      return apiRequest("POST", "/api/client-portal/login", data);
    },
    onSuccess: (response) => {
      onLogin({
        clientId: response.clientId,
        firmId: response.firmId,
        email: email
      });
      toast({
        title: "Login Successful",
        description: "Welcome to your client portal.",
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials or expired token.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === "credentials") {
      loginMutation.mutate({ email, password });
    } else {
      loginMutation.mutate({ token });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Client Portal Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={loginMethod === "credentials" ? "default" : "outline"}
              onClick={() => setLoginMethod("credentials")}
              className="flex-1"
            >
              Email & Password
            </Button>
            <Button
              variant={loginMethod === "token" ? "default" : "outline"}
              onClick={() => setLoginMethod("token")}
              className="flex-1"
            >
              Secure Link
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginMethod === "credentials" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="token">Access Token</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your secure access token"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Main client portal dashboard
const ClientDashboard = ({ clientAuth }: { clientAuth: ClientAuth }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch client invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["client-invoices", clientAuth.clientId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/client-portal/${clientAuth.clientId}/invoices`);
      return response as Invoice[];
    }
  });

  // Fetch client payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["client-payments", clientAuth.clientId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/client-portal/${clientAuth.clientId}/payments`);
      return response as Payment[];
    }
  });

  // Create payment intent
  const createPaymentMutation = useMutation({
    mutationFn: async (invoice: Invoice) => {
      return apiRequest("POST", "/api/billing/create-payment-intent", {
        invoiceId: invoice.id,
        amount: invoice.amount,
        clientEmail: clientAuth.email
      });
    },
    onSuccess: (response) => {
      setClientSecret(response.clientSecret);
    },
    onError: () => {
      toast({
        title: "Payment Setup Failed",
        description: "Unable to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    createPaymentMutation.mutate(invoice);
  };

  const handlePaymentSuccess = () => {
    setSelectedInvoice(null);
    setClientSecret(null);
    queryClient.invalidateQueries({ queryKey: ["client-invoices"] });
    queryClient.invalidateQueries({ queryKey: ["client-payments"] });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      sent: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
      overdue: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
      draft: { variant: "outline" as const, icon: Eye, color: "text-gray-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-gray-600">{clientAuth.email}</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Statements
              </Button>
              <Button variant="outline">Contact Support</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoices Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Your Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No invoices found</p>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">Invoice #{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-gray-600">
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">${(invoice.amount / 100).toFixed(2)}</p>
                            {getStatusBadge(invoice.status)}
                          </div>
                        </div>
                        
                        {invoice.status === "sent" && (
                          <div className="flex justify-end mt-4">
                            <Button 
                              onClick={() => handlePayInvoice(invoice)}
                              disabled={createPaymentMutation.isPending}
                            >
                              {createPaymentMutation.isPending ? "Setting up..." : "Pay Now"}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
                    ))}
                  </div>
                ) : payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No payments yet</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">${(payment.amount / 100).toFixed(2)}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(payment.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={payment.status === "succeeded" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedInvoice && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pay Invoice</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => {
                  setSelectedInvoice(null);
                  setClientSecret(null);
                }}
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm invoice={selectedInvoice} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Main component
export default function ClientPortal() {
  const [clientAuth, setClientAuth] = useState<ClientAuth | null>(null);

  if (!clientAuth) {
    return <ClientLogin onLogin={setClientAuth} />;
  }

  return <ClientDashboard clientAuth={clientAuth} />;
}