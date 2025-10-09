"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  MoreVertical,
  Mail as MailIcon,
  X,
} from "lucide-react";
import { AdminUser } from "@/app/admin/_services/admin-service";
import { useAuth } from "@/app/admin/_provider/auth-context";

interface ManageUsersProps {
  users: AdminUser[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  userTypeFilter: string;
  setUserTypeFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
}

export default function ManageUsers({
  users,
  searchTerm,
  setSearchTerm,
  userTypeFilter,
  setUserTypeFilter,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: ManageUsersProps) {
  const {
    userTypes,
    statusTypes,
    userRoles,
    dimensionsLoading,
    inviteUser,
    inviteUserLoading,
  } = useAuth();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    user_type: "",
    role: "",
    user_status: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    user_type: "",
    role: "",
    user_status: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setFormData({
      email: "",
      user_type: "",
      role: "",
      user_status: "",
    });
    setFormErrors({
      email: "",
      user_type: "",
      role: "",
      user_status: "",
    });
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleCloseModal = () => {
    if (!inviteUserLoading) {
      setIsModalOpen(false);
    }
  };

  const validateForm = () => {
    const errors = {
      email: "",
      user_type: "",
      role: "",
      user_status: "",
    };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.user_type) {
      errors.user_type = "User type is required";
      isValid = false;
    }

    if (!formData.role) {
      errors.role = "Role is required";
      isValid = false;
    }

    if (!formData.user_status) {
      errors.user_status = "Status is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    const result = await inviteUser(formData);

    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        handleCloseModal();
        // Optionally refresh the users list here
        window.location.reload();
      }, 2000);
    } else {
      setSubmitError(result.error || "Failed to invite user");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError("");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (dimensionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* User Type Filter - Dynamic from dimension table */}
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {userTypes.map((type) => (
                <option key={type.id} value={type.key}>
                  {type.display_name}
                </option>
              ))}
            </select>

            {/* Role Filter - Dynamic from user_roles table */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {userRoles.map((role) => (
                <option key={role.id} value={role.key}>
                  {role.name}
                </option>
              ))}
            </select>

            {/* Status Filter - Dynamic from dimension table */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusTypes.map((status) => (
                <option key={status.id} value={status.key}>
                  {status.display_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Invite User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Invite New User
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={inviteUserLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={inviteUserLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="user@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* User Type Dropdown */}
              <div>
                <label
                  htmlFor="user_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="user_type"
                  value={formData.user_type}
                  onChange={(e) =>
                    handleInputChange("user_type", e.target.value)
                  }
                  disabled={inviteUserLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.user_type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select user type</option>
                  {userTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.display_name}
                    </option>
                  ))}
                </select>
                {formErrors.user_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.user_type}
                  </p>
                )}
              </div>

              {/* Role Dropdown */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  disabled={inviteUserLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.role ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select role</option>
                  {userRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                )}
              </div>

              {/* Status Dropdown */}
              <div>
                <label
                  htmlFor="user_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="user_status"
                  value={formData.user_status}
                  onChange={(e) =>
                    handleInputChange("user_status", e.target.value)
                  }
                  disabled={inviteUserLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    formErrors.user_status
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select status</option>
                  {statusTypes.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.display_name}
                    </option>
                  ))}
                </select>
                {formErrors.user_status && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.user_status}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">
                    User invited successfully!
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={inviteUserLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteUserLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {inviteUserLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {inviteUserLoading ? "Inviting..." : "Invite User"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  User
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  User Type
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  Role
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  Last Login
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  Created
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ backgroundColor: "hsl(var(--secondary) / 0.25)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.userType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin || "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1">
                        <MailIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 p-1">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{users.length}</span> of{" "}
          <span className="font-medium">{users.length}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <button className="px-3 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-lg hover:bg-primary/90">
            1
          </button>
          <button
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
