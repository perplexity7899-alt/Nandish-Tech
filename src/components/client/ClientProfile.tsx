import { useAuth } from "@/context/AuthContext";
import { User, Mail, Calendar } from "lucide-react";

export default function ClientProfile() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">My Profile</h2>

      <div className="bg-card border border-border rounded-xl p-6 max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="text-sm font-medium text-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
