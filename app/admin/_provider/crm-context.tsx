"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { crmDatabase } from "../_lib";
import { CompanyManagement } from "../_lib/supabase-crm";

interface CRMContextType {
  state: {
    loading: boolean;
    companyManagement: CompanyManagement[];
  };
  actions: {
    setLoading: (loading: boolean) => void;
    setCompanyManagement: (companyManagement: CompanyManagement[]) => void;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [companyManagement, setCompanyManagement] = useState<
    CompanyManagement[]
  >([]);

  const value: CRMContextType = {
    state: {
      loading,
      companyManagement,
    },
    actions: {
      setLoading,
      setCompanyManagement,
    },
  };

  useEffect(() => {
    fetchCompanyManagement();
  }, []);

  const fetchCompanyManagement = async () => {
    try {
      const result = await crmDatabase.getCompanyManagement();
      setCompanyManagement(result);
    } catch (error) {
      console.error("Error fetching company management:", error);
    }
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
