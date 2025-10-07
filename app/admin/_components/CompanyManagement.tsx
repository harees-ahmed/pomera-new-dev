"use client";
import React from "react";
import { CompanyManagement } from "../_lib/supabase-crm";
import { AdminTable } from ".";
import EditFieldModal from "./EditFieldModal";
import { Trash2, Edit } from "lucide-react";
export default function CompanyForm({
  state,
}: {
  state: { companyManagement: CompanyManagement[] };
}) {
  const [open, setOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState<any | null>(null);
  const colName: {
    key: string;
    label: string;
    render?: (value: any, row: any) => any;
  }[] = [];
  const management = state.companyManagement[0];
  const hasActions = state.companyManagement.some(
    (m) => m.is_edit || m.is_delete
  );

  const onAction = (action?: "edit" | "delete", row?: any) => {
    if (action === "edit" && row) {
      setActiveRow(row);
      setOpen(true);
    }
  };

  Object.keys(management ? management : {}).forEach((key) => {
    if (
      key === "id" ||
      key === "created_at" ||
      key === "dim_field_types" ||
      key === "is_delete" ||
      key === "is_edit"
    )
      return;

    colName.push({
      key: key,
      label: key.replace("_", " "),
    });
  });

  if (hasActions) {
    colName.push({
      key: "actions",
      label: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex items-center gap-2">
          {row.is_edit ? (
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => onAction("edit", row)}
            >
              <Edit className="h-4 w-4" />
            </button>
          ) : null}
          {row.is_delete ? (
            <button
              type="button"
              className="text-rose-600 hover:text-rose-800 text-sm"
              onClick={() => onAction("delete", row)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ),
    } as any);
  }

  const data = state.companyManagement.map((management) => {
    const {
      dim_field_types: { field_type },
      dim_ref,
      field_name,
      is_delete,
      is_edit,
      is_mandatory,
    } = management;

    return {
      field_type: field_type,
      dim_ref: dim_ref || "Null",
      field_name,
      is_delete,
      is_edit,
      is_mandatory: is_mandatory ? "Yes" : "No",
    };
  });

  return (
    <div className="bg-white">
      <h3 className="text-lg font-semibold mb-4">{"Company Management"}</h3>

      <AdminTable
        columns={colName}
        data={data}
        className="mb-6"
        emptyMessage="No companies found"
      />
      <EditFieldModal
        open={open}
        onClose={() => setOpen(false)}
        row={activeRow}
      />
    </div>
  );
}
