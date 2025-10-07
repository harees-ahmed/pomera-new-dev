"use client";
import React from "react";
import { DimensionValue } from "../_lib/supabase-crm";

interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  row: any | null;
}

export default function ViewModal({ open, onClose, row }: ViewModalProps) {
  const [options, setOptions] = React.useState<DimensionValue[]>([]);

  React.useEffect(() => {
    if (!open || !row) return;

    setOptions([]);

    // Only check for dropdown values if field type is dropdown
    if (row.field_type === "dropdown") {
      // Check if there are dropdown_values (show inline values)
      if (row.dropdown_values && Array.isArray(row.dropdown_values)) {
        const formattedValues = row.dropdown_values
          .filter((val: any) => val.is_active)
          .sort((a: any, b: any) => a.display_order - b.display_order)
          .map((val: any, index: number) => ({
            id: index + 1,
            name: val.display_name,
            display_order: val.display_order,
            is_active: val.is_active,
          }));
        setOptions(formattedValues);
      }
    }
  }, [open, row]);

  if (!open || !row) return null;

  // Don't show modal if field type is not dropdown
  if (row.field_type !== "dropdown") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-md border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Possible Values for {row.field_name?.replace("_", " ")}
          </h4>
        </div>
        <div className="p-4 space-y-3">
          {options.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 mb-2">
                Available options ({options.length}):
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <span className="text-sm text-gray-900">{opt.name}</span>
                    <span className="text-xs text-gray-500">
                      Order: {opt.display_order}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-2">
              No values configured for this dropdown field.
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
