// lib/utils/error-handler.ts

import { toast } from 'react-hot-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface ErrorResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    errorMessage?: string;
    showToast?: boolean;
    onError?: (error: unknown) => void;
  }
): Promise<ErrorResponse<T>> {
  try {
    const data = await operation();
    return { data };
  } catch (error: unknown) {
    console.error('Operation failed:', error);
    
    const errorMessage = options?.errorMessage || (error instanceof Error ? error.message : 'An unexpected error occurred');
    
    if (options?.showToast !== false) {
      toast.error(errorMessage);
    }
    
    if (options?.onError) {
      options.onError(error);
    }
    
    const errorObj = error as Record<string, unknown>;
    return {
      error: {
        message: errorMessage,
        code: errorObj.code as string | undefined,
        details: errorObj.details as string | undefined
      }
    };
  }
}

export function handleSupabaseError(error: unknown): string {
  const errorObj = error as Record<string, unknown>;
  if (errorObj.code === '23505') {
    return 'This record already exists';
  }
  if (errorObj.code === '23503') {
    return 'Cannot delete this record as it is referenced by other data';
  }
  if (errorObj.code === '42501') {
    return 'You do not have permission to perform this action';
  }
  if (errorObj.code === 'PGRST116') {
    return 'Record not found';
  }
  return (errorObj.message as string) || 'Database operation failed';
}