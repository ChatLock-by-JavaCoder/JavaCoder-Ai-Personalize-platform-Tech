import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield } from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminUsers = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (error || !data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
    fetchAdminUsers();
  };

  const fetchAdminUsers = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles (
          full_name,
          email
        )
      `)
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Failed to fetch admin users");
    } else {
      setAdminUsers(data as any);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    // First, find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newAdminEmail)
      .single();

    if (profileError || !profile) {
      toast.error("User not found. Make sure the user has signed up first.");
      setCreating(false);
      return;
    }

    // Check if already admin
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", profile.id)
      .eq("role", "admin")
      .single();

    if (existingRole) {
      toast.error("This user is already an admin");
      setCreating(false);
      return;
    }

    // Add admin role
    const { error } = await supabase
      .from("user_roles")
      .insert([{
        user_id: profile.id,
        role: "admin"
      }]);

    if (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin user");
    } else {
      toast.success("Admin user created successfully!");
      setNewAdminEmail("");
      fetchAdminUsers();
    }
    setCreating(false);
  };

  const handleRevokeAdmin = async (roleId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${userName}?`)) {
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    if (error) {
      console.error("Error revoking admin:", error);
      toast.error("Failed to revoke admin access");
    } else {
      toast.success("Admin access revoked");
      fetchAdminUsers();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin User Management</h1>
            <p className="text-muted-foreground">
              Manage admin users and their access
            </p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent" />
                  <CardTitle>Add New Admin</CardTitle>
                </div>
                <CardDescription>
                  Promote an existing user to admin role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">User Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      placeholder="user@example.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      The user must already have an account on the platform
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={creating}
                  >
                    {creating ? "Adding..." : "Add Admin User"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <CardTitle>Current Admin Users</CardTitle>
                </div>
                <CardDescription>
                  List of all users with admin privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No admin users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      adminUsers.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">
                            {admin.profiles?.full_name || "N/A"}
                          </TableCell>
                          <TableCell>{admin.profiles?.email || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(admin.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeAdmin(admin.id, admin.profiles?.full_name || "this user")}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Revoke
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
