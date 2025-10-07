"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { crmDatabase } from "../_lib";
import {
  CompanyManagement,
  CompanyField,
  FieldType,
} from "../_lib/supabase-crm";

interface CRMContextType {
  state: {
    loading: boolean;
    companyManagement: CompanyManagement[];
    fieldTypes: FieldType[];
  };
  actions: {
    setLoading: (loading: boolean) => void;
    setCompanyManagement: (companyManagement: CompanyManagement[]) => void;
    addCompanyFields: (companyFields: CompanyField) => void;
    deleteCompanyField: (fieldId: string) => void;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [companyManagement, setCompanyManagement] = useState<
    CompanyManagement[]
  >([]);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);

  useEffect(() => {
    Promise.all([fetchFieldTypes(), fetchCompanyManagement()]);
  }, []);

  const fetchFieldTypes = async () => {
    try {
      const result = await crmDatabase.getFieldTypes();
      setFieldTypes(result);
    } catch (error) {
      console.error("Error fetching field types:", error);
    }
  };

  const fetchCompanyManagement = async () => {
    try {
      const result = await crmDatabase.getCompanyManagement();
      setCompanyManagement(result);
    } catch (error) {
      console.error("Error fetching company management:", error);
    }
  };

  const deleteCompanyField = async (fieldId: string) => {
    try {
      setLoading(true);
      await crmDatabase.deleteCompanyField(fieldId);
      await fetchCompanyManagement();
    } catch (error) {
      console.error("Error deleting company management:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCompanyFields = async (companyFields: CompanyField) => {
    try {
      setLoading(true);
      await crmDatabase.addCompanyField(companyFields);
      await fetchCompanyManagement();
    } catch (error) {
      console.error("Error adding company management:", error);
    } finally {
      setLoading(false);
    }
  };

  const value: CRMContextType = {
    state: {
      loading,
      companyManagement,
      fieldTypes,
    },
    actions: {
      setLoading,
      setCompanyManagement,
      addCompanyFields,
      deleteCompanyField,
    },
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
