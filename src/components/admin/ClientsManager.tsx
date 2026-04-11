import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  hasPurchased: boolean;
}

export default function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [allClientsCount, setAllClientsCount] = useState(0);
  const [purchasedClientsCount, setPurchasedClientsCount] = useState(0);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);

      // Get all profiles (registered clients)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Get all project purchases to identify clients who made purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from("project_purchases")
        .select("user_id, payment_status");

      if (purchasesError) {
        console.warn("Could not fetch purchases:", purchasesError);
      }

      // Create a set of user IDs who have made any purchases
      const purchasedUserIds = new Set<string>();
      if (purchases) {
        purchases.forEach((purchase: any) => {
          // Count any purchase record as a made purchase (regardless of payment_status)
          if (purchase.user_id) {
            purchasedUserIds.add(purchase.user_id);
          }
        });
      }

      // Enrich clients with purchase information
      const enrichedClients: Client[] = (profiles || []).map((profile) => ({
        id: profile.user_id,
        email: profile.user_id, // User ID as fallback
        full_name: profile.full_name || "Unknown",
        phone: "N/A",
        created_at: profile.created_at || new Date().toISOString(),
        hasPurchased: purchasedUserIds.has(profile.user_id),
      }));

      setClients(enrichedClients);
      setAllClientsCount(enrichedClients.length);
      setPurchasedClientsCount(enrichedClients.filter((c) => c.hasPurchased).length);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const allClients = clients.filter((c) => !c.hasPurchased);
  const purchasedClients = clients.filter((c) => c.hasPurchased);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all registered clients and their purchases
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-4xl font-bold mt-2">{allClientsCount}</p>
            </div>
            <Users className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clients with Purchases</p>
              <p className="text-4xl font-bold mt-2">{purchasedClientsCount}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-primary opacity-20" />
          </div>
        </Card>
      </div>

      {/* Clients Tabs */}
      <Card>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full border-b rounded-none bg-transparent p-0 flex flex-wrap">
            <TabsTrigger
              value="all"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap overflow-hidden"
            >
              <Users className="w-4 h-4 mr-0.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">All Clients</span>
              <span className="sm:hidden">All</span>
              <span className="ml-0.5 sm:ml-1">({allClientsCount})</span>
            </TabsTrigger>
            <TabsTrigger
              value="registered"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap overflow-hidden"
            >
              <Users className="w-4 h-4 mr-0.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Only Registered</span>
              <span className="sm:hidden">Reg</span>
              <span className="ml-0.5 sm:ml-1">({allClientsCount - purchasedClientsCount})</span>
            </TabsTrigger>
            <TabsTrigger
              value="purchased"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm flex-1 sm:flex-none whitespace-nowrap overflow-hidden"
            >
              <ShoppingCart className="w-4 h-4 mr-0.5 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">With Purchases</span>
              <span className="sm:hidden">Paid</span>
              <span className="ml-0.5 sm:ml-1">({purchasedClientsCount})</span>
            </TabsTrigger>
          </TabsList>

          {/* All Clients Tab */}
          <TabsContent value="all" className="p-6">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No clients registered yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {client.full_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{client.full_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                            {client.phone !== "N/A" && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined: {formatDate(client.created_at)}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          No Purchase
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Only Registered Clients Tab */}
          <TabsContent value="registered" className="p-6">
            {allClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  All registered clients have made purchases. No clients without purchases.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-700">
                            {client.full_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{client.full_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                            {client.phone && client.phone !== "N/A" && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined: {formatDate(client.created_at)}
                        </p>
                        <Badge variant="outline" className="mt-2 bg-yellow-50">
                          Only Registered
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Purchased Clients Tab */}
          <TabsContent value="purchased" className="p-6">
            {purchasedClients.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No clients with purchases yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchasedClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-primary/5"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                          <span className="text-sm font-bold">
                            {client.full_name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{client.full_name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </span>
                            {client.phone !== "N/A" && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Joined: {formatDate(client.created_at)}
                        </p>
                        <Badge className="mt-2 bg-primary">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Purchased
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
