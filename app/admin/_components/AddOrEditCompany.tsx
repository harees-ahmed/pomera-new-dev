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

  const [dropdownValues, setDropdownValues] = React.useState([
    { display_name: "", display_order: 1, is_active: true },
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
        field_type_id: row.field_type_id || "",
        field_type: row.field_type || "text",
        is_mandatory: row.is_mandatory === "Yes" || row.is_mandatory === true,
        is_edit: row.is_edit || false,
        is_delete: row.is_delete || false,
        dropdown_values: row.dropdown_values || [],
      });
    } else {
      // Add mode - initialize with default values
      setFormData({
        field_name: "",
        field_type_id:
          state.fieldTypes.length > 0 ? state.fieldTypes[0].id : "",
        field_type:
          state.fieldTypes.length > 0 ? state.fieldTypes[0].field_type : "text",
        is_mandatory: false,
        is_edit: true,
        is_delete: true,
        dropdown_values: [],
      });
    }
  }, [open, row, state.fieldTypes]);

  const handleInputChange = (fieldName: string, value: any) => {
    if (fieldName === "field_type") {
      // When field type changes, also update the field_type_id
      const selectedFieldType = state.fieldTypes.find(
        (ft) => ft.field_type === value
      );
      setFormData((prev) => ({
        ...prev,
        field_type: value,
        field_type_id: selectedFieldType?.id || "",
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
      console.log("Updating field:", formData);
      // TODO: Implement update functionality
    } else {
      const saveData = {
        field_name: formData.field_name,
        is_mandatory: formData.is_mandatory,
        field_type: formData.field_type_id,
        dropdown_values:
          formData.field_type === "dropdown"
            ? dropdownValues.filter((v) => v.display_name.trim() !== "")
            : null,
        is_edit: formData.is_edit,
        is_delete: formData.is_delete,
      };
      actions.addCompanyFields(saveData as CompanyField);
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.field_type || "text"}
                onChange={(e) =>
                  handleInputChange("field_type", e.target.value)
                }
              >
                <option value="">Select field type</option>
                {state.fieldTypes.map((fieldType) => (
                  <option key={fieldType.id} value={fieldType.field_type}>
                    {fieldType.field_type}
                  </option>
                ))}
              </select>
            </div>

            {formData.field_type === "dropdown" && (
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

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_edit || false}
                  onChange={(e) =>
                    handleInputChange("is_edit", e.target.checked)
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Allow Edit
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_delete || false}
                  onChange={(e) =>
                    handleInputChange("is_delete", e.target.checked)
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Allow Delete
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
