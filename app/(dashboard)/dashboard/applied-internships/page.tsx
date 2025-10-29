"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Search,
  Calendar,
  MapPin,
  FileText,
  X,
  Briefcase,
  Users,
  Ticket,
  Download,
} from "lucide-react";

// TypeScript types for application data
interface Company {
  company_name?: string;
  logo_url?: string;
  email?: string;
}

interface Internship {
  id?: string;
  title?: string;
  description?: string;
  company?: Company;
}

interface Program {
  id?: string;
  title?: string;
  description?: string;
  level?: string;
  company?: Company;
}

interface Event {
  id?: string;
  title?: string;
  description?: string;
  event_date?: string;
  location?: string;
  company?: Company;
}

interface Application {
  id: string;
  application_type: "internship" | "program" | "event";
  status: string;
  created_at: string;
  updated_at: string;
  
  // Internship specific fields
  duration_months?: number;
  department?: string;
  location?: string;
  work_mode?: string;
  cover_letter_url?: string;
  support_letter_url?: string;
  
  // Program specific fields
  level?: string;
  expectations?: string;
  comments?: string;
  
  // Event specific fields
  rsvp_status?: boolean;
  
  // Relations
  internship?: Internship;
  program?: Program;
  event?: Event;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-blue-100 text-blue-800",
          dot: "bg-blue-500",
        };
      case "reviewed":
        return {
          bg: "bg-purple-100 text-purple-800",
          dot: "bg-purple-500",
        };
      case "accepted":
        return {
          bg: "bg-green-100 text-green-800",
          dot: "bg-green-500",
        };
      case "rejected":
        return { 
          bg: "bg-red-100 text-red-800", 
          dot: "bg-red-500" 
        };
      case "rsvp_confirmed":
        return {
          bg: "bg-green-100 text-green-800",
          dot: "bg-green-500",
        };
      default:
        return {
          bg: "bg-gray-100 text-gray-800",
          dot: "bg-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {status.replace('_', ' ').toUpperCase()}
    </div>
  );
};

const ViewModal = ({
  application,
  isOpen,
  onClose,
}: {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !application) return null;

  const getApplicationDetails = () => {
    switch (application.application_type) {
      case "internship":
        return {
          title: application.internship?.title || "Internship",
          company: application.internship?.company?.company_name || "Company",
          type: "Internship Application",
          fields: [
            { label: "Duration", value: application.duration_months ? `${application.duration_months} months` : "Not specified" },
            { label: "Department", value: application.department || "Not specified" },
            { label: "Location", value: application.location || "Not specified" },
            { label: "Work Mode", value: application.work_mode || "Not specified" },
          ],
          files: [
            { label: "Cover Letter", url: application.cover_letter_url },
            { label: "Support Letter", url: application.support_letter_url },
          ]
        };
      case "program":
        return {
          title: application.program?.title || "Program",
          company: application.program?.company?.company_name || "Company",
          type: "Program Application",
          fields: [
            { label: "Level", value: application.level || "Not specified" },
            { label: "Expectations", value: application.expectations || "Not specified" },
            { label: "Comments", value: application.comments || "Not specified" },
          ],
          files: []
        };
      case "event":
        return {
          title: application.event?.title || "Event",
          company: application.event?.company?.company_name || "Company",
          type: "Event RSVP",
          fields: [
            { label: "Event Date", value: application.event?.event_date ? new Date(application.event.event_date).toLocaleDateString() : "Not specified" },
            { label: "Location", value: application.event?.location || "Not specified" },
            { label: "Expectations", value: application.expectations || "Not specified" },
            { label: "Comments", value: application.comments || "Not specified" },
            { label: "RSVP Status", value: application.rsvp_status ? "Confirmed" : "Not Confirmed" },
          ],
          files: []
        };
      default:
        return {
          title: "Application",
          company: "Company",
          type: "Application",
          fields: [],
          files: []
        };
    }
  };

  const details = getApplicationDetails();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <Eye size={24} className="text-blue-500" />
              Application Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {details.type}: <span className="font-semibold text-blue-800">{details.title}</span>
            </p>
            <p className="text-xs text-gray-500">Company: {details.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Application Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span>Last Updated: {new Date(application.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold">Status:</span>
                  <StatusBadge status={application.status} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Details</h3>
              <div className="space-y-2">
                {details.fields.map((field, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{field.label}:</span>
                    <span className="font-medium text-gray-900">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Files Section */}
          {details.files.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Submitted Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.files.map((file, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{file.label}</h4>
                    {file.url ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Download size={16} />
                        View Document
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">No document submitted</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ApplicationCard = ({ 
  application, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  application: Application; 
  onView: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}) => {
  const getApplicationInfo = () => {
    switch (application.application_type) {
      case "internship":
        return {
          title: application.internship?.title || "Internship",
          company: application.internship?.company?.company_name || "Company",
          icon: Briefcase,
          details: [
            { icon: MapPin, text: application.location || "Location not specified" },
            { icon: Clock, text: application.duration_months ? `${application.duration_months} months` : "Duration not specified" },
            { icon: Building, text: application.department || "Department not specified" },
          ]
        };
      case "program":
        return {
          title: application.program?.title || "Program",
          company: application.program?.company?.company_name || "Company",
          icon: Users,
          details: [
            { icon: FileText, text: application.level ? `Level: ${application.level}` : "Level not specified" },
            { icon: FileText, text: application.expectations ? "Expectations provided" : "No expectations" },
          ]
        };
      case "event":
        return {
          title: application.event?.title || "Event",
          company: application.event?.company?.company_name || "Company",
          icon: Ticket,
          details: [
            { icon: Calendar, text: application.event?.event_date ? new Date(application.event.event_date).toLocaleDateString() : "Date not specified" },
            { icon: MapPin, text: application.event?.location || "Location not specified" },
            { icon: CheckCircle, text: application.rsvp_status ? "RSVP Confirmed" : "RSVP Pending" },
          ]
        };
      default:
        return {
          title: "Application",
          company: "Company",
          icon: FileText,
          details: []
        };
    }
  };

  const info = getApplicationInfo();
  const IconComponent = info.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconComponent size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {info.title}
              </h3>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Building size={14} /> {info.company}
              </p>
            </div>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={14} /> 
            Applied: {new Date(application.created_at).toLocaleDateString()}
          </div>
          {info.details.map((detail, index) => (
            <div key={index} className="flex items-center gap-2">
              <detail.icon size={14} />
              {detail.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onView(application)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Eye size={14} /> View
          </button>
          <button
            onClick={() => onEdit(application)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"internships" | "programs" | "events">("internships");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    application: Application | null;
  }>({ isOpen: false, application: null });

  const tabs = [
    { id: "internships" as const, name: "Internships", icon: Briefcase, endpoint: "/api/students/applications/fetch/getInternship" },
    { id: "programs" as const, name: "Programs", icon: Users, endpoint: "/api/students/applications/fetch/getPrograms" },
    { id: "events" as const, name: "Events", icon: Ticket, endpoint: "/api/students/applications/fetch/getEvents" },
  ];

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTabConfig = tabs.find(tab => tab.id === activeTab);
      if (!activeTabConfig) return;

      const res = await fetch(activeTabConfig.endpoint);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${activeTabConfig.name}: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Handle the API response structure
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else if (Array.isArray(data)) {
        // Fallback if the response is directly an array
        setApplications(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = 
        (app.internship?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (app.program?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (app.event?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (app.internship?.company?.company_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (app.program?.company?.company_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (app.event?.company?.company_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All" || app.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    setFilteredApplications(filtered);
  };

  const handleView = (application: Application) => {
    setViewModal({ isOpen: true, application });
  };

  const handleEdit = (application: Application) => {
    // Implement edit functionality
    console.log("Edit application:", application);
    alert("Edit functionality to be implemented");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        // Implement delete functionality
        console.log("Delete application:", id);
        setApplications(applications.filter(app => app.id !== id));
        alert("Application deleted successfully");
      } catch (error) {
        console.error("Failed to delete application:", error);
        alert("Failed to delete application");
      }
    }
  };

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === "pending").length;
    const accepted = applications.filter(app => app.status === "accepted").length;
    const rejected = applications.filter(app => app.status === "rejected").length;

    return { total, pending, accepted, rejected };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading {tabs.find(tab => tab.id === activeTab)?.name} applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Manage and track all your applications in one place</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent size={18} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="rsvp_confirmed">RSVP Confirmed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Applications</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "All" 
                ? "Try adjusting your search or filters"
                : `You haven't applied to any ${activeTab} yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* View Modal */}
        <ViewModal
          application={viewModal.application}
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, application: null })}
        />
      </div>
    </div>
  );
}