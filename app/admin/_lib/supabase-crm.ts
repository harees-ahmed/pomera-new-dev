// lib/supabase-crm.ts

import { supabase } from "./";

// Types
export interface CompanyManagement {
  id: string;
  field_name: string;
  is_mandatory: boolean;
  field_type: string;
  dim_ref: string;
  is_edit: boolean;
  is_delete: boolean;
  dim_field_types: {
    field_type: string;
  };
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
        .select("*, dim_field_types(field_type)");

      if (error) throw error;
      return data as CompanyManagement[];
    }, "Failed to fetch company management");
  }
}

export const crmDatabase = new CRMDatabase();
