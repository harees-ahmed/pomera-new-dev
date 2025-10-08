"use client";
import React from "react";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import { useCRM } from "../_provider/crm-context";

interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  row: any | null;
}

interface DropdownValue {
  id: string;
  display_name: string;
  display_order: number;
  is_active: boolean;
}

export default function ViewModal({ open, onClose, row }: ViewModalProps) {
  const { actions } = useCRM();
  const [values, setValues] = React.useState<DropdownValue[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({
    id: "",
    display_name: "",
    display_order: 0,
    is_active: true,
  });
  const [isAdding, setIsAdding] = React.useState(false);
  const [newValue, setNewValue] = React.useState({
    id: "",
    display_name: "",
    display_order: 1,
    is_active: true,
  });
  const [saving, setSaving] = React.useState(false);

  const generateUUID = () => {
    return crypto.randomUUID();
  };

  React.useEffect(() => {
    if (!open || !row) return;

    setValues([]);
    setEditingId(null);
    setIsAdding(false);

    // Only check for dropdown values if field type is dropdown
    if (row.field_type === "dropdown") {
      // Check if there are dropdown_values (show inline values)
      if (row.dropdown_values && Array.isArray(row.dropdown_values)) {
        const sortedValues = [...row.dropdown_values]
          .map((v: any) => ({
            ...v,
            id: v.id || generateUUID(), // Generate UUID if missing
          }))
          .sort((a: any, b: any) => a.display_order - b.display_order);
        setValues(sortedValues);

        // Set next display_order for new values
        const maxOrder = Math.max(
          ...sortedValues.map((v: any) => v.display_order),
          0
        );
        setNewValue((prev) => ({
          ...prev,
          id: generateUUID(),
          display_order: maxOrder + 1,
        }));
      } else {
        // Initialize with UUID for first value
        setNewValue((prev) => ({ ...prev, id: generateUUID() }));
      }
    }
  }, [open, row]);

  const handleEdit = (id: string) => {
    const value = values.find((v) => v.id === id);
    if (value) {
      setEditingId(id);
      setEditForm({ ...value });
      setIsAdding(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = () => {
    if (!editForm.display_name.trim()) return;

    const newValues = values.map((v) => (v.id === editingId ? editForm : v));
    setValues(newValues);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const newValues = values.filter((v) => v.id !== id);
    setValues(newValues);
  };

  const handleAddNew = () => {
    if (!newValue.display_name.trim()) return;

    setValues([...values, newValue]);
    setNewValue({
      id: generateUUID(),
      display_name: "",
      display_order: newValue.display_order + 1,
      is_active: true,
    });
    setIsAdding(false);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await actions.updateCompanyField(row.id, {
        dropdown_values: values,
      });
      onClose();
    } catch (error) {
      console.error("Error saving dropdown values:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !row) return null;

  // Don't show modal if field type is not dropdown
  if (row.field_type !== "dropdown") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-2xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Edit Values for {row.field_name?.replace(/_/g, " ")}
          </h4>
        </div>
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {values.length > 0 ? (
            <div className="space-y-2">
              {values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded border"
                >
                  {editingId === value.id ? (
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        className="col-span-6 px-2 py-1 text-sm border rounded"
                        placeholder="Display Name"
                        value={editForm.display_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            display_name: e.target.value,
                          })
                        }
                      />
                      <input
                        type="number"
                        className="col-span-2 px-2 py-1 text-sm border rounded"
                        placeholder="Order"
                        value={editForm.display_order}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <label className="col-span-2 flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={editForm.is_active}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              is_active: e.target.checked,
                            })
                          }
                        />
                        Active
                      </label>
                      <div className="col-span-2 flex gap-1">
                        <button
                          type="button"
                          className="p-1 text-green-600 hover:text-green-800"
                          onClick={handleSaveEdit}
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="p-1 text-gray-600 hover:text-gray-800"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                        <span className="col-span-6 text-sm text-gray-900">
                          {value.display_name}
                        </span>
                        <span className="col-span-2 text-xs text-gray-500">
                          Order: {value.display_order}
                        </span>
                        <span className="col-span-2 text-xs">
                          {value.is_active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </span>
                        <div className="col-span-2 flex gap-1">
                          <button
                            type="button"
                            className="p-1 text-blue-600 hover:text-blue-800"
                            onClick={() => handleEdit(value.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="p-1 text-rose-600 hover:text-rose-800"
                            onClick={() => handleDelete(value.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-2">
              No values configured for this dropdown field.
            </div>
          )}

          {/* Add New Value Section */}
          {isAdding ? (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  className="col-span-6 px-2 py-1 text-sm border rounded"
                  placeholder="Display Name"
                  value={newValue.display_name}
                  onChange={(e) =>
                    setNewValue({ ...newValue, display_name: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="col-span-2 px-2 py-1 text-sm border rounded"
                  placeholder="Order"
                  value={newValue.display_order}
                  onChange={(e) =>
                    setNewValue({
                      ...newValue,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <label className="col-span-2 flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={newValue.is_active}
                    onChange={(e) =>
                      setNewValue({ ...newValue, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
                <div className="col-span-2 flex gap-1">
                  <button
                    type="button"
                    className="p-1 text-green-600 hover:text-green-800"
                    onClick={handleAddNew}
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-600 hover:text-gray-800"
                    onClick={() => setIsAdding(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Value
            </button>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSaveAll}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
