"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { crmDatabase, type Company, type DimensionValue } from "../_lib";
import { toast } from "react-hot-toast";

interface CRMContextType {
  // Data
  companies: Company[];
  dimensions: {
    statuses: DimensionValue[];
    sources: DimensionValue[];
    scores: DimensionValue[];
    sizes: DimensionValue[];
    revenues: DimensionValue[];
    positionTypes: DimensionValue[];
    noteTypes: DimensionValue[];
    contactMethods: DimensionValue[];
    contactTypes: DimensionValue[];
    addressTypes: DimensionValue[];
    fileCategories: DimensionValue[];
    industries: DimensionValue[];
    documentTypes: DimensionValue[];
  };

  // UI State
  loading: boolean;
  activeTab: string;
  searchTerm: string;

  // Company State
  selectedCompany: Company | null;
  isEditMode: boolean;
  showAddForm: boolean;

  // Related Data
  notes: any[];
  contacts: any[];
  addresses: any[];

  // Actions
  loadData: () => Promise<void>;
  loadCompanies: () => Promise<void>;
  loadCompanyNotes: (companyId: string) => Promise<void>;
  loadCompanyContacts: (companyId: string) => Promise<void>;
  loadCompanyAddresses: (companyId: string) => Promise<void>;
  handleAddCompany: () => Promise<void>;
  handleViewCompany: (company: Company) => Promise<void>;
  handleEditCompany: (company: Company) => Promise<void>;
  handleStatusChange: (status: Company["company_status"]) => Promise<void>;
  handleCompanyUpdate: (updatedCompany: Company) => Promise<void>;
  closeModal: () => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
  setShowAddForm: (show: boolean) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: ReactNode }) {
  // Data State
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dimensions, setDimensions] = useState<CRMContextType["dimensions"]>({
    statuses: [],
    sources: [],
    scores: [],
    sizes: [],
    revenues: [],
    positionTypes: [],
    noteTypes: [],
    contactMethods: [],
    contactTypes: [],
    addressTypes: [],
    fileCategories: [],
    industries: [],
    documentTypes: [],
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Company State
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Related Data
  const [notes, setNotes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      // Check Supabase configuration
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (
        !supabaseUrl ||
        !supabaseKey ||
        supabaseUrl === "your_supabase_url_here" ||
        supabaseKey === "your_supabase_anon_key_here"
      ) {
        console.warn("Supabase not configured");
        toast.error(
          "Database not configured. Please check your environment variables."
        );
        setCompanies([]);
        setLoading(false);
        return;
      }

      // Load companies
      const companiesResult = await crmDatabase.getCompanies();
      if (companiesResult) {
        setCompanies(companiesResult);
      } else {
        setCompanies([]);
      }

      // Load dimensions
      try {
        const [
          statuses,
          sources,
          scores,
          sizes,
          revenues,
          positionTypes,
          noteTypes,
          contactMethods,
          contactTypes,
          addressTypes,
          fileCategories,
          industries,
          documentTypes,
        ] = await Promise.all([
          crmDatabase.getDimensions("dim_company_status"),
          crmDatabase.getDimensions("dim_lead_source"),
          crmDatabase.getDimensions("dim_lead_score"),
          crmDatabase.getDimensions("dim_company_size"),
          crmDatabase.getDimensions("dim_annual_revenue"),
          crmDatabase.getDimensions("dim_position_type"),
          crmDatabase.getDimensions("dim_note_type"),
          crmDatabase.getDimensions("dim_contact_method"),
          crmDatabase.getDimensions("dim_contact_type"),
          crmDatabase.getDimensions("dim_address_type"),
          crmDatabase.getDimensions("dim_file_category"),
          crmDatabase.getDimensions("dim_industry"),
          crmDatabase.getDocumentTypes(),
        ]);

        setDimensions({
          statuses: statuses || [],
          sources: sources || [],
          scores: scores || [],
          sizes: sizes || [],
          revenues: revenues || [],
          positionTypes: positionTypes || [],
          noteTypes: noteTypes || [],
          contactMethods: contactMethods || [],
          contactTypes: contactTypes || [],
          addressTypes: addressTypes || [],
          fileCategories: fileCategories || [],
          industries: industries || [],
          documentTypes: documentTypes || [],
        });

        // Set default active tab
        if (!activeTab && statuses && statuses.length > 0) {
          setActiveTab(statuses[0].name.toLowerCase());
        }
      } catch (dimensionError) {
        console.error("Error loading dimensions:", dimensionError);
        toast.error("Failed to load some dimension data");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Load companies only
  const loadCompanies = async () => {
    try {
      const result = await crmDatabase.getCompanies();
      if (result) {
        setCompanies(result);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  // Load company notes
  const loadCompanyNotes = async (companyId: string) => {
    try {
      const result = await crmDatabase.getCompanyNotes(companyId);
      if (result) {
        setNotes(result);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  // Load company contacts
  const loadCompanyContacts = async (companyId: string) => {
    try {
      const result = await crmDatabase.getCompanyContacts(companyId);
      if (result) {
        setContacts(result);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // Load company addresses
  const loadCompanyAddresses = async (companyId: string) => {
    try {
      const result = await crmDatabase.getCompanyAddresses(companyId);
      if (result) {
        setAddresses(result);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  // Handle add company
  const handleAddCompany = async () => {
    setShowAddForm(false);
    await loadCompanies();
    toast.success("Company added successfully!");
  };

  // Handle view company
  const handleViewCompany = async (company: Company) => {
    setSelectedCompany(company);
    setIsEditMode(false);
    await Promise.all([
      loadCompanyNotes(company.company_id),
      loadCompanyAddresses(company.company_id),
      loadCompanyContacts(company.company_id),
    ]);
  };

  // Handle edit company
  const handleEditCompany = async (company: Company) => {
    setSelectedCompany(company);
    setIsEditMode(true);
    await Promise.all([
      loadCompanyNotes(company.company_id),
      loadCompanyAddresses(company.company_id),
      loadCompanyContacts(company.company_id),
    ]);
  };

  // Handle status change
  const handleStatusChange = async (status: Company["company_status"]) => {
    if (!selectedCompany) return;

    try {
      const result = await crmDatabase.updateCompanyStatus(
        selectedCompany.company_id,
        status
      );
      if (result) {
        setSelectedCompany({ ...selectedCompany, company_status: status });
        await loadCompanies();
        toast.success("Status updated successfully");
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Handle company update
  const handleCompanyUpdate = async (updatedCompany: Company) => {
    setSelectedCompany(updatedCompany);
    await loadCompanies();
  };

  // Close modal
  const closeModal = () => {
    setSelectedCompany(null);
    setIsEditMode(false);
    setNotes([]);
    setContacts([]);
    setAddresses([]);
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const value: CRMContextType = {
    // Data
    companies,
    dimensions,

    // UI State
    loading,
    activeTab,
    searchTerm,

    // Company State
    selectedCompany,
    isEditMode,
    showAddForm,

    // Related Data
    notes,
    contacts,
    addresses,

    // Actions
    loadData,
    loadCompanies,
    loadCompanyNotes,
    loadCompanyContacts,
    loadCompanyAddresses,
    handleAddCompany,
    handleViewCompany,
    handleEditCompany,
    handleStatusChange,
    handleCompanyUpdate,
    closeModal,
    setActiveTab,
    setSearchTerm,
    setShowAddForm,
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
