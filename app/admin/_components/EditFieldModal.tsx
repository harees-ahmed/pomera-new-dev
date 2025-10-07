"use client";
import React from "react";
import { crmDatabase, DimensionValue } from "@/lib/supabase-crm";

interface EditFieldModalProps {
  open: boolean;
  onClose: () => void;
  row: any | null;
}

export default function EditFieldModal({
  open,
  onClose,
  row,
}: EditFieldModalProps) {
  const [options, setOptions] = React.useState<DimensionValue[]>([]);
  const [value, setValue] = React.useState<string>("");
  const isDropdown = Boolean(row?.dim_ref);

  React.useEffect(() => {
    if (!open) return;
    setValue("");
    if (isDropdown && row?.dim_ref) {
      crmDatabase
        .getDimensions(row.dim_ref)
        .then((vals) => setOptions(vals || []))
        .catch(() => setOptions([]));
    }
  }, [open, isDropdown, row?.dim_ref]);

  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-md border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Edit {row.field_name?.replace("_", " ")}
          </h4>
        </div>
        <div className="p-4 space-y-3">
          <label className="block text-xs text-gray-600">
            {row.field_name?.replace("_", " ")}
          </label>
          {isDropdown ? (
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Select...</option>
              {options.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${row.field_name}`}
            />
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
