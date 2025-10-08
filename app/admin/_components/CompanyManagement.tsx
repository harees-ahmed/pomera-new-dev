"use client";
import React from "react";
import { Trash2, Edit, Eye, Plus } from "lucide-react";
import { CompanyManagement } from "../_lib/supabase-crm";
import { AdminTable, ViewModal, AddOrEditCompany, DeleteCompany } from ".";
import { useCRM } from "../_provider/crm-context";

export default function CompanyForm({
  state,
}: {
  state: { companyManagement: CompanyManagement[] };
}) {
  const { actions } = useCRM();
  const [open, setOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState<any | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const colName: {
    key: string;
    label: string;
    render?: (value: any, row: any) => any;
  }[] = [];
  const management = state.companyManagement[0];

  const onAction = (
    action?: "edit" | "delete" | "viewValues" | "add",
    row?: any
  ) => {
    if (action === "edit" && row) {
      setActiveRow(row);
      setEditOpen(true);
    }

    if (action === "viewValues" && row) {
      setActiveRow(row);
      setOpen(true);
    }

    if (action === "delete" && row) {
      setActiveRow(row);
      setDeleteOpen(true);
    }

    if (action === "add") {
      setActiveRow(null); // No row for add mode
      setEditOpen(true);
    }
  };

  Object.keys(management ? management : {}).forEach((key) => {
    if (
      key === "id" ||
      key === "created_at" ||
      key === "dim_field_types" ||
      key === "dropdown_values"
    )
      return;

    colName.push({
      key: key,
      label: key.replace("_", " "),
    });
  });

  colName.push({
    key: "values",
    label: "Values",
    render: (_value: any, row: any) => {
      if (row.field_type === "dropdown") {
        return (
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => onAction("viewValues", row)}
          >
            <Eye className="h-4 w-4" />
          </button>
        );
      }
      return "-";
    },
  });

  colName.push({
    key: "actions",
    label: "Actions",
    render: (_value: any, row: any) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-800 text-sm"
          onClick={() => onAction("edit", row)}
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="text-rose-600 hover:text-rose-800 text-sm"
          onClick={() => onAction("delete", row)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ),
  } as any);

  const data = state.companyManagement.map((management: CompanyManagement) => {
    const {
      id,
      field_type,
      dim_field_types,
      field_name,
      is_mandatory,
      display_order,
      dropdown_values,
    } = management;

    return {
      id,
      field_type: dim_field_types.field_type, // Display name
      field_type_uuid: field_type, // UUID for saving
      field_name,
      display_order,
      is_mandatory: is_mandatory ? "Yes" : "No",
      dropdown_values,
    };
  });

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Company Management</h3>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => onAction("add")}
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      <AdminTable
        columns={colName}
        data={data}
        className="mb-6"
        emptyMessage="No companies found"
      />
      <ViewModal open={open} onClose={() => setOpen(false)} row={activeRow} />

      <AddOrEditCompany
        open={editOpen}
        onClose={() => setEditOpen(false)}
        row={activeRow}
      />

      <DeleteCompany
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        row={activeRow}
        onConfirm={() => {
          console.log("Delete confirmed for:", activeRow);
          setDeleteOpen(false);
          actions.deleteCompanyField(activeRow.id);
        }}
      />
    </div>
  );
}
