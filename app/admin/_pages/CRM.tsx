"use client";

import { useCRM } from "../_provider/crm-context";
import { CompanyForm } from "../_components";
import { Loader2 } from "lucide-react";

export default function CRM() {
  const { state } = useCRM();

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white rounded-lg shadow-sm border flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-lg font-medium">Loading CRM</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg shadow-sm border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        {/* <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {dimensions.statuses.map((status) => (
                <button
                  key={status.name}
                  onClick={() => setActiveTab(status.name.toLowerCase())}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === status.name.toLowerCase()
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.name}
                </button>
              ))}
            </nav>
          </div>
        </div> */}

        <CompanyForm state={state} />
      </div>
    </div>
  );
}
