"use client";
import React from "react";
import { CompanyField } from "../_lib/supabase-crm";
import { useCRM } from "../_provider/crm-context";

interface AddOrEditCompanyProps {
  open: boolean;
  onClose: () => void;
  row: any | null; // null for add mode, row data for edit mode
}

export default function AddOrEditCompany({
  open,
  onClose,
  row,
}: AddOrEditCompanyProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [showDropdownValues, setShowDropdownValues] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const generateUUID = () => {
    return crypto.randomUUID();
  };

  const [dropdownValues, setDropdownValues] = React.useState(() => [
    {
      id: crypto.randomUUID(),
      display_name: "",
      display_order: 1,
      is_active: true,
    },
  ]);
  const { state, actions } = useCRM();
  const isEditMode = !!row;

  React.useEffect(() => {
    if (!open) {
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, [open]);

  React.useEffect(() => {
    if (row) {
      // Edit mode - initialize with existing row data
      setFormData({
        field_name: row.field_name || "",
        field_type: row.field_type || "text", // Display name
        field_type_uuid: row.field_type_uuid || "", // UUID for saving
        is_mandatory: row.is_mandatory === "Yes" || row.is_mandatory === true,
        display_order: row.display_order || 1,
        dropdown_values: row.dropdown_values || [],
      });
    } else {
      // Add mode - initialize with default values
      // Calculate next display_order (max + 1)
      const maxDisplayOrder =
        state.companyManagement.length > 0
          ? Math.max(
              ...state.companyManagement.map((m) => m.display_order || 0)
            )
          : 0;

      setFormData({
        field_name: "",
        field_type:
          state.fieldTypes.length > 0 ? state.fieldTypes[0].field_type : "text",
        field_type_uuid:
          state.fieldTypes.length > 0 ? state.fieldTypes[0].id : "",
        is_mandatory: false,
        display_order: maxDisplayOrder + 1,
        dropdown_values: [],
      });
    }
  }, [open, row, state.fieldTypes, state.companyManagement]);

  const handleInputChange = (fieldName: string, value: any) => {
    if (fieldName === "field_type") {
      const selectedFieldType = state.fieldTypes.find(
        (ft) => ft.field_type === value
      );
      setFormData((prev) => ({
        ...prev,
        field_type: value, // Display name
        field_type_uuid: selectedFieldType?.id || "", // UUID
      }));

      // Reset dropdown values when field type changes
      if (value !== "dropdown") {
        setFormData((prev) => ({
          ...prev,
          dropdown_values: [],
        }));
        setShowDropdownValues(false);
      } else {
        setShowDropdownValues(true);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    }
  };

  const addNewValue = () => {
    setDropdownValues((prev) => [
      ...prev,
      {
        id: generateUUID(),
        display_name: "",
        display_order: prev.length + 1,
        is_active: true,
      },
    ]);
  };

  const removeValue = (index: number) => {
    setDropdownValues((prev) => prev.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, field: string, value: any) => {
    setDropdownValues((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSave = async () => {
    if (row) {
      // Edit mode - update existing field
      // Note: field_type is not editable for existing fields to maintain data integrity
      const updateData: Partial<CompanyField> = {
        field_name: formData.field_name,
        is_mandatory: formData.is_mandatory,
        display_order: formData.display_order,
      };

      await actions.updateCompanyField(row.id, updateData);
    } else {
      // Add mode - create new field
      const saveData: Partial<CompanyField> = {
        field_name: formData.field_name,
        is_mandatory: formData.is_mandatory,
        field_type_id: formData.field_type_uuid, // Send UUID, not display name
        display_order: formData.display_order,

        dropdown_values:
          formData.field_type === "dropdown"
            ? dropdownValues
                .filter((v) => v.display_name.trim() !== "")
                .map((v) => ({
                  id: v.id || generateUUID(),
                  display_name: v.display_name,
                  display_order: v.display_order,
                  is_active: v.is_active,
                }))
            : undefined,
      };
      await actions.addCompanyFields(saveData as CompanyField);
    }
    onClose();
  };

  return (
    showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-md shadow-lg w-full max-w-md border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900">
              {isEditMode
                ? `Edit Field: ${row.field_name?.replace("_", " ")}`
                : "Add New Field"}
            </h4>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.field_name || ""}
                onChange={(e) =>
                  handleInputChange("field_name", e.target.value)
                }
                placeholder="Enter field name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Type
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.field_type || "text"}
                onChange={(e) =>
                  handleInputChange("field_type", e.target.value)
                }
                disabled={isEditMode}
              >
                <option value="">Select field type</option>
                {state.fieldTypes.map((fieldType) => (
                  <option key={fieldType.id} value={fieldType.field_type}>
                    {fieldType.field_type}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Field type cannot be changed after creation to maintain data
                  integrity.
                </p>
              )}
            </div>

            {formData.field_type === "dropdown" && !isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dropdown Values
                </label>

                <div className="mt-2">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    onClick={() => setShowDropdownValues(!showDropdownValues)}
                  >
                    {showDropdownValues
                      ? "Hide values"
                      : "Configure dropdown values"}
                  </button>
                </div>

                {showDropdownValues && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">
                      Dropdown Values
                    </h5>

                    <div className="space-y-3">
                      {dropdownValues.map((value, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-2"
                        >
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={value.display_name}
                            onChange={(e) =>
                              updateValue(index, "display_name", e.target.value)
                            }
                            placeholder={`Value ${index + 1}`}
                          />
                          <input
                            type="number"
                            className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm"
                            value={value.display_order}
                            onChange={(e) =>
                              updateValue(
                                index,
                                "display_order",
                                parseInt(e.target.value) || 1
                              )
                            }
                            min="1"
                            placeholder="Order"
                          />
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={value.is_active}
                              onChange={(e) =>
                                updateValue(
                                  index,
                                  "is_active",
                                  e.target.checked
                                )
                              }
                              className="mr-1 h-3 w-3"
                            />
                            <span className="text-xs text-gray-600">
                              Active
                            </span>
                          </label>
                          {dropdownValues.length > 1 && (
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={() => removeValue(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                        onClick={addNewValue}
                      >
                        + Add Value
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.field_type === "dropdown" && isEditMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> To edit dropdown values for this field,
                  use the eye icon (
                  <span className="inline-flex items-center mx-1">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  ) in the Values column of the table.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.display_order || 1}
                onChange={(e) =>
                  handleInputChange(
                    "display_order",
                    parseInt(e.target.value) || 1
                  )
                }
                min="1"
                placeholder="Display order"
              />
              <p className="mt-1 text-xs text-gray-500">
                Order in which this field appears in forms and tables
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_mandatory || false}
                  onChange={(e) =>
                    handleInputChange("is_mandatory", e.target.checked)
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Mandatory
                </span>
              </label>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs text-gray-600 space-y-1">
                {isEditMode ? (
                  <div>
                    <strong>Field Type:</strong> {row.field_type}
                  </div>
                ) : (
                  <div>
                    <strong>Mode:</strong> Adding new field
                  </div>
                )}
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
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSave}
            >
              {isEditMode ? "Update Field" : "Add Field"}
            </button>
          </div>
        </div>
      </div>
    )
  );
}
