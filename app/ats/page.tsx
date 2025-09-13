"use client"

import { useState, useEffect } from 'react';
import CRMHeader from '@/components/CRMHeader';
import { crmDatabase } from '@/lib/supabase-crm';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  postedDate: string;
  applicants: number;
  description: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  status: string;
  appliedDate: string;
  experience: string;
  skills: string[];
}

export default function ATSPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  // Mock data for now - in a real app this would come from Supabase
  const [jobPostings] = useState<JobPosting[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'Active',
      postedDate: '2024-01-15',
      applicants: 12,
      description: 'We are looking for a senior software engineer to join our team...'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Innovate Inc',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'Active',
      postedDate: '2024-01-14',
      applicants: 8,
      description: 'Lead product development and strategy...'
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'Design Studio',
      location: 'Remote',
      type: 'Contract',
      status: 'Closed',
      postedDate: '2024-01-10',
      applicants: 15,
      description: 'Create amazing user experiences...'
    }
  ]);

  const [applicants] = useState<Applicant[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '(555) 123-4567',
      jobTitle: 'Senior Software Engineer',
      status: 'Applied',
      appliedDate: '2024-01-16',
      experience: '5 years',
      skills: ['React', 'Node.js', 'TypeScript']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '(555) 987-6543',
      jobTitle: 'Product Manager',
      status: 'Interview',
      appliedDate: '2024-01-15',
      experience: '7 years',
      skills: ['Product Strategy', 'Agile', 'Analytics']
    }
  ]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesData = await crmDatabase.getCompanies();
      setCompanies(companiesData || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Closed': return 'text-red-600 bg-red-50';
      case 'Applied': return 'text-blue-600 bg-blue-50';
      case 'Interview': return 'text-yellow-600 bg-yellow-50';
      case 'Hired': return 'text-green-600 bg-green-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderJobPostings = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search job postings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Job Postings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobPostings.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Posted: {job.postedDate}</span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {job.applicants} applicants
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                <Eye className="h-4 w-4" />
                <span>View</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-green-600 hover:text-green-800">
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {applicant.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                        <div className="text-sm text-gray-500">{applicant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {applicant.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.appliedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {applicant.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CRMHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Applicant Tracking System</h1>
          <p className="text-gray-600 mt-2">Manage job postings and track applicants</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{jobPostings.filter(j => j.status === 'Active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                <p className="text-2xl font-semibold text-gray-900">{applicants.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-semibold text-gray-900">{applicants.filter(a => a.status === 'Interview').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-semibold text-gray-900">{applicants.filter(a => a.status === 'Hired').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Job Postings
              </button>
              <button
                onClick={() => setActiveTab('applicants')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applicants'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applicants
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'jobs' ? renderJobPostings() : renderApplicants()}
      </div>
    </div>
  );
}
