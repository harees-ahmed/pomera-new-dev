// lib/supabase-crm.ts

import { supabase } from "./";

// Types
export interface CompanyManagement {
  id: string;
  field_name: string;
  is_mandatory: boolean;
  field_type: string;
  is_edit: boolean;
  is_delete: boolean;
  dim_field_types: {
    field_type: string;
  };
  dropdown_values?: Array<{
    display_name: string;
    display_order: number;
    is_active: boolean;
  }>;
}

export interface CompanyField {
  id?: string;
  field_name: string;
  is_mandatory: boolean;
  field_type: string;
  field_type_id: string;
  dropdown_values?: Array<{
    display_name: string;
    display_order: number;
    is_active: boolean;
  }>;
  is_edit: boolean;
  is_delete: boolean;
}

export interface FieldType {
  id: string;
  field_type: string;
}

export interface DimensionTable {
  table_name: string;
  display_name: string;
  is_active: boolean;
}

// Dimension Types
export interface DimensionValue {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
  color?: string;
}

// Error handling wrapper
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage: string = "Operation failed"
): Promise<T> {
  try {
    const data = await operation();
    return data;
  } catch (error: unknown) {
    // Enhanced error logging for debugging
    console.error(`${errorMessage}:`, {
      error: error,
      message: (error as Error)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
      stack: (error as Error)?.stack,
    });

    // Create more descriptive error messages
    let errorMsg = errorMessage;
    if (error && typeof error === "object") {
      if ((error as Error)?.message) {
        errorMsg += `: ${(error as Error).message}`;
      }
      if ((error as any)?.details) {
        errorMsg += ` (${(error as any).details})`;
      }
      if ((error as any)?.hint) {
        errorMsg += ` - Hint: ${(error as any).hint}`;
      }
    } else if (error) {
      errorMsg += `: ${String(error)}`;
    }

    // Throw the enhanced error
    throw new Error(errorMsg);
  }
}

class CRMDatabase {
  async getCompanyManagement() {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from("company_management")
        .select("*, dim_field_types(field_type), dropdown_values");

      if (error) throw error;
      return data as CompanyManagement[];
    }, "Failed to fetch company management");
  }
  async addCompanyField(companyManagement: CompanyField) {
    return withErrorHandling(async () => {
      const { error } = await supabase
        .from("company_management")
        .insert([companyManagement]);

      if (error) throw error;
      return true;
    }, "Failed to add company field");
  }

  async getFieldTypes() {
    return withErrorHandling(async () => {
      const { data, error } = await supabase
        .from("dim_field_types")
        .select("*");
      if (error) throw error;
      return data as FieldType[];
    }, "Failed to fetch field types");
  }

  async deleteCompanyField(fieldId: string) {
    return withErrorHandling(async () => {
      const { error } = await supabase
        .from("company_management")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;
      return true;
    }, "Failed to delete company field");
  }

  // async updateCompanyField(companyManagement: CompanyManagement) {
  //   return withErrorHandling(async () => {
  //     const { data, error } = await supabase
  //       .from("company_management")
  //       .update(companyManagement);
  //     if (error) throw error;
  //     return data as CompanyManagement;
  //   }, "Failed to update company field");
  // }
}

export const crmDatabase = new CRMDatabase();
