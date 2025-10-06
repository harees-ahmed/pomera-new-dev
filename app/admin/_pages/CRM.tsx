"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { useCRM } from "../_provider/crm-context";
import CompanyForm from "../../crm/components/CompanyForm";
import CompanyList from "../../crm/components/CompanyList";
import CompanyModal from "../../crm/components/CompanyModal";

export default function CRM() {
  const {
    companies,
    dimensions,
    loading,
    activeTab,
    searchTerm,
    selectedCompany,
    showAddForm,
    notes,
    contacts,
    addresses,
    handleAddCompany,
    handleViewCompany,
    handleEditCompany,
    handleStatusChange,
    closeModal,
    setActiveTab,
    setSearchTerm,
    setShowAddForm,
  } = useCRM();

  // Filter companies based on active tab and search
  const filteredCompanies =
    companies.length > 0
      ? companies.filter((company) => {
          // Use flexible matching for status
          const matchesTab = dimensions.statuses.some(
            (status) =>
              status.name.toLowerCase() === activeTab &&
              (company.company_status?.toLowerCase() ===
                status.name.toLowerCase() ||
                company.company_status
                  ?.toLowerCase()
                  .includes(status.name.toLowerCase()) ||
                status.name
                  .toLowerCase()
                  .includes(company.company_status?.toLowerCase() || ""))
          );

          const matchesSearch =
            company.company_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            company.industry?.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesTab && (searchTerm === "" || matchesSearch);
        })
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
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
        </div>
        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter & Sort
          </Button>
        </div>
        {/* Add Company Form */}
        {showAddForm && (
          <CompanyForm
            dimensions={dimensions}
            onSuccess={handleAddCompany}
            onCancel={() => setShowAddForm(false)}
          />
        )}
        {/* Company List */}
        <CompanyList
          companies={filteredCompanies}
          loading={loading}
          activeTab={activeTab}
          onViewLead={handleViewCompany}
          onEditLead={handleEditCompany}
          dimensions={dimensions}
        />
        {/* Company Modal */}
        {selectedCompany && (
          <CompanyModal
            company={selectedCompany}
            onClose={closeModal}
            dimensions={dimensions}
            notes={notes}
            contacts={contacts}
            addresses={addresses}
            onNotesChange={() => {}} // Handled by context
            onContactsChange={() => {}} // Handled by context
            onAddressesChange={() => {}} // Handled by context
            onStatusChange={handleStatusChange}
            saving={false}
          />
        )}
      </div>
    </div>
  );
}
