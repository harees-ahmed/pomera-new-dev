// lib/supabase-crm.ts

import { supabase } from "./";
import { getBaseUrl } from "@/lib/base-url";

// Types
export interface CompanyManagement {
  id: string;
  field_name: string;
  is_mandatory: boolean;
  field_type: string;
  display_order: number;
  is_edit: boolean;
  is_delete: boolean;
  dim_field_types: {
    field_type: string;
  };
  dropdown_values?: Array<{
    id: string;
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
  display_order: number;
  dropdown_values?: Array<{
    id: string;
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

// Helper function to alter companies table
async function alterCompaniesTable(
  action: "add" | "remove",
  fieldName: string,
  fieldType?: string
) {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/admin/alter-companies-table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        fieldName,
        fieldType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to alter companies table:", data);
      // Don't throw error, just log it - we don't want to block the main operation
      return { success: false, error: data.error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error calling alter companies table API:", error);
    return { success: false, error: String(error) };
  }
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
        .select("*, dim_field_types(field_type), dropdown_values")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as CompanyManagement[];
    }, "Failed to fetch company management");
  }
  async addCompanyField(companyManagement: CompanyField) {
    return withErrorHandling(async () => {
      // Map field_type_id to field_type for database
      const { field_type_id, ...rest } = companyManagement;
      const dataToInsert = {
        ...rest,
        field_type: field_type_id, // Database column is field_type
      };

      const { error } = await supabase
        .from("company_management")
        .insert([dataToInsert]);

      if (error) throw error;

      // Get the field type name from dim_field_types to determine column type
      const { data: fieldTypeData } = await supabase
        .from("dim_field_types")
        .select("field_type")
        .eq("id", field_type_id)
        .single();

      // Alter companies table to add the new column
      if (fieldTypeData && companyManagement.field_name) {
        await alterCompaniesTable(
          "add",
          companyManagement.field_name,
          fieldTypeData.field_type
        );
      }

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
      // Get the field name before deleting
      const { data: fieldData } = await supabase
        .from("company_management")
        .select("field_name")
        .eq("id", fieldId)
        .single();

      const { error } = await supabase
        .from("company_management")
        .delete()
        .eq("id", fieldId);

      if (error) throw error;

      // Alter companies table to remove the column
      if (fieldData?.field_name) {
        await alterCompaniesTable("remove", fieldData.field_name);
      }

      return true;
    }, "Failed to delete company field");
  }

  async updateCompanyField(
    fieldId: string,
    companyField: Partial<CompanyField>
  ) {
    return withErrorHandling(async () => {
      const { error } = await supabase
        .from("company_management")
        .update(companyField)
        .eq("id", fieldId);

      if (error) throw error;
      return true;
    }, "Failed to update company field");
  }
}

export const crmDatabase = new CRMDatabase();
