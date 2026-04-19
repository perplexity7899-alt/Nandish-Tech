import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mail, Clock, Phone, MapPin } from "lucide-react";

interface ClientReply {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_type: string;
  delivery_timeline: string;
  project_details: string;
  inquiry_type: string;
  created_at: string;
}

export default function CustomProjectReplies() {
  const [selectedReply, setSelectedReply] = useState<ClientReply | null>(null);

  // Fetch all client replies, ordered by creation date (first come first serve)
  const { data: replies = [], isLoading, refetch } = useQuery({
    queryKey: ["client-replies"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("client_replies")
        .select("*")
        .order("created_at", { ascending: false }); // Newest first

      if (error) {
        console.error("Error fetching client replies:", error);
        throw error;
      }
      return (data || []) as ClientReply[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = (supabase as any)
      .channel("client_replies_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "client_replies",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Custom Project Inquiries
        </h1>
        <p className="text-muted-foreground">
          Manage client service inquiries in order of arrival
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Replies List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Inquiries ({replies.length})
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading inquiries...
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inquiries yet
              </div>
            ) : (
              replies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => setSelectedReply(reply)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedReply?.id === reply.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground truncate">
                    {reply.client_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    {reply.client_email}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="inline-block px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary">
                      {reply.service_type.replace(/-/g, " ")}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(reply.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedReply ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {selectedReply.client_name}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {selectedReply.inquiry_type}
                </p>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <a
                      href={`mailto:${selectedReply.client_email}`}
                      className="text-primary hover:underline break-all"
                    >
                      {selectedReply.client_email}
                    </a>
                  </div>
                  {selectedReply.client_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                      <a
                        href={`tel:${selectedReply.client_phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedReply.client_phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="capitalize">
                      {selectedReply.service_type.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{selectedReply.delivery_timeline}</span>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">
                  Project Details
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedReply.project_details || "No details provided"}
                  </p>
                </div>
              </div>

              {/* Meta Information */}
              <div className="text-xs text-muted-foreground border-t border-border pt-4">
                <p>
                  Received on{" "}
                  {new Date(selectedReply.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg border-2 border-dashed border-border">
              <div className="text-center">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Select an inquiry to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
