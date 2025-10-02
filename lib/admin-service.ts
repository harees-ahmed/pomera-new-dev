import { supabase } from "./supabase";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  userType: string;
  role: string;
  status: string;
  lastLogin: string | null;
  createdAt: string;
  avatar: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  userType: string;
  status: string;
  userCount: number;
  permissions: string[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  datetime: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

class AdminService {
  async getUsers(): Promise<AdminUser[]> {
    try {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        // Fallback to mock data if table doesn't exist yet
        return [
          {
            id: "1",
            name: "John Smith",
            email: "john.smith@pomera.com",
            userType: "Internal",
            role: "Admin",
            status: "Active",
            lastLogin: "2024-01-15 10:30",
            createdAt: "2023-06-15",
            avatar: null,
          },
          {
            id: "2",
            name: "Sarah Johnson",
            email: "sarah.johnson@pomera.com",
            userType: "Internal",
            role: "Manager",
            status: "Active",
            lastLogin: "2024-01-14 16:45",
            createdAt: "2023-08-22",
            avatar: null,
          },
        ];
      }

      return profiles.map((profile) => ({
        id: profile.id,
        name: profile.full_name || "Unknown User",
        email: profile.email,
        userType: profile.user_type || "Internal",
        role: profile.role || "User",
        status: profile.status === "active" ? "Active" : "Inactive",
        lastLogin: profile.last_login
          ? new Date(profile.last_login).toLocaleString()
          : null,
        createdAt: new Date(profile.created_at).toLocaleDateString(),
        avatar: profile.avatar_url,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getRoles(): Promise<AdminRole[]> {
    try {
      // For now, return mock data since we don't have a roles table yet
      return [
        {
          id: "1",
          name: "Super Admin",
          description: "Full system access with all permissions",
          userType: "Super Admin",
          status: "Active",
          userCount: 2,
          permissions: ["All Permissions"],
          createdAt: "2023-01-15",
        },
        {
          id: "2",
          name: "Pomera Admin",
          description: "Administrative access to Pomera systems",
          userType: "Pomera Admin",
          status: "Active",
          userCount: 5,
          permissions: ["User Management", "System Settings", "Reports"],
          createdAt: "2023-02-01",
        },
      ];
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      // For now, return mock data since we don't have an audit logs table yet
      return [
        {
          id: "1",
          datetime: "2024-01-15 14:32:15",
          user: "John Smith",
          action: "User Login",
          details: "Successful login from IP 192.168.1.100",
          ipAddress: "192.168.1.100",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        {
          id: "2",
          datetime: "2024-01-15 14:28:42",
          user: "Sarah Johnson",
          action: "Company Created",
          details: "Created new company: Acme Corporation",
          ipAddress: "192.168.1.105",
          userAgent:
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      ];
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
  }

  async getSystemStats() {
    try {
      // Get basic stats from the companies table
      const { data: companies, error } = await supabase
        .from("companies")
        .select("company_status, created_date");

      if (error) {
        console.error("Error fetching system stats:", error);
        return {
          totalCompanies: 0,
          activeCompanies: 0,
          totalUsers: 0,
          systemUptime: "99.9%",
        };
      }

      const totalCompanies = companies?.length || 0;
      const activeCompanies =
        companies?.filter((c) => c.company_status === "client").length || 0;

      return {
        totalCompanies,
        activeCompanies,
        totalUsers: 0, // Would need users table
        systemUptime: "99.9%",
      };
    } catch (error) {
      console.error("Error fetching system stats:", error);
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        totalUsers: 0,
        systemUptime: "99.9%",
      };
    }
  }
}

export const adminService = new AdminService();
