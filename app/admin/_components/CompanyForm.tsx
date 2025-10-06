"use client";
import { CompanyManagement } from "../_lib/supabase-crm";
import { AdminTable } from ".";

export default function CompanyForm({
  state,
}: {
  state: { companyManagement: CompanyManagement[] };
}) {
  function capitalizeFirstLetter(str: string) {
    if (typeof str !== "string" || str.length === 0) {
      return str; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const colName: { key: string; label: string }[] = [];
  const management = state.companyManagement[0];

  Object.keys(management ? management : {}).forEach((key) => {
    if (key === "id" || key === "created_at" || key === "dim_field_types")
      return;

    colName.push({
      key: key,
      label: capitalizeFirstLetter(key).replace("_", " "),
    });
  });

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
      is_delete: is_delete ? "Yes" : "No",
      is_edit: is_edit ? "Yes" : "No",
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
    </div>
  );
}
