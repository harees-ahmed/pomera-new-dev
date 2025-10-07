"use client";
import React from "react";

interface DeleteCompanyProps {
  open: boolean;
  onClose: () => void;
  row: any | null;
  onConfirm: () => void;
}

export default function DeleteCompany({
  open,
  onClose,
  row,
  onConfirm,
}: DeleteCompanyProps) {
  if (!open || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-md border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Confirm Delete</h4>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the field{" "}
            <strong>&ldquo;{row.field_name}&rdquo;</strong>? This action cannot
            be undone.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-xs text-red-600">
              <div>
                <strong>Field:</strong> {row.field_name}
              </div>
              <div>
                <strong>Type:</strong> {row.field_type}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={onConfirm}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
