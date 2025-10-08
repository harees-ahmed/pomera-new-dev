import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Map field types to PostgreSQL column types
const getPostgresType = (fieldType: string): string => {
  const typeMap: Record<string, string> = {
    text: "VARCHAR(255)",
    number: "NUMERIC",
    dropdown: "VARCHAR(255)",
    date: "DATE",
    email: "VARCHAR(255)",
    phone: "VARCHAR(20)",
    url: "VARCHAR(500)",
    textarea: "TEXT",
    checkbox: "BOOLEAN",
  };

  return typeMap[fieldType.toLowerCase()] || "TEXT";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, fieldName, fieldType } = body;

    if (!action || !fieldName) {
      return NextResponse.json(
        { error: "Missing required parameters: action, fieldName" },
        { status: 400 }
      );
    }

    let sql = "";

    if (action === "add") {
      if (!fieldType) {
        return NextResponse.json(
          { error: "Missing required parameter: fieldType" },
          { status: 400 }
        );
      }

      const postgresType = getPostgresType(fieldType);

      // Use IF NOT EXISTS to avoid errors if column already exists
      sql = `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = '${fieldName}'
          ) THEN
            ALTER TABLE companies ADD COLUMN "${fieldName}" ${postgresType};
          END IF;
        END $$;
      `;
    } else if (action === "remove") {
      // Use IF EXISTS to avoid errors if column doesn't exist
      sql = `
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' AND column_name = '${fieldName}'
          ) THEN
            ALTER TABLE companies DROP COLUMN "${fieldName}";
          END IF;
        END $$;
      `;
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    // Execute the SQL using Supabase RPC
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });

    if (error) {
      console.error("RPC error:", error);

      return NextResponse.json(
        {
          error:
            "Failed to alter table. Make sure exec_sql function exists in database.",
          details: error.message,
          hint: "Run database/exec_sql_function.sql in Supabase SQL Editor",
          sql: sql,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Column ${action === "add" ? "added" : "removed"} successfully`,
      fieldName,
    });
  } catch (error: any) {
    console.error("Error altering companies table:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
