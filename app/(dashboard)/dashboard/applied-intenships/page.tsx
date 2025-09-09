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
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  X,
  Save,
} from "lucide-react";

// Mock data with user information
const appliedInternships = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechBam Solutions",
    status: "Pending",
    appliedDate: "2024-01-15",
    location: "Remote",
    duration: "3 months",
    salary: "$800/month",
    userInfo: {
      name: "John Bamenda",
      email: "john.bamenda@email.com",
      phone: "+237 678 901 234",
      resume: "john_bamenda_resume.pdf",
    },
    coverLetter:
      "I am passionate about frontend development and excited to contribute to TechBam Solutions. My experience with React and UI design will help your team deliver great products.",
  },
  {
    id: 2,
    title: "Marketing Intern",
    company: "Bamenda Digital",
    status: "Interview",
    appliedDate: "2024-01-10",
    location: "Bamenda, CM",
    duration: "6 months",
    salary: "$600/month",
    userInfo: {
      name: "John Bamenda",
      email: "john.bamenda@email.com",
      phone: "+237 678 901 234",
      resume: "john_bamenda_resume.pdf",
    },
    coverLetter:
      "I believe my creativity and communication skills make me a strong fit for Bamenda Digital's marketing team. I look forward to learning and growing with you.",
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Analytics Pro",
    status: "Accepted",
    appliedDate: "2024-01-05",
    location: "Hybrid",
    duration: "4 months",
    salary: "$1000/month",
    userInfo: {
      name: "John Bamenda",
      email: "john.bamenda@email.com",
      phone: "+237 678 901 234",
      resume: "john_bamenda_resume.pdf",
    },
    coverLetter:
      "With my strong background in Python and machine learning, I'm excited to contribute to Analytics Pro's data science initiatives.",
  },
  {
    id: 4,
    title: "UX Design Intern",
    company: "Creative Studios",
    status: "Rejected",
    appliedDate: "2024-01-20",
    location: "Yaoundé, CM",
    duration: "3 months",
    salary: "$750/month",
    userInfo: {
      name: "John Bamenda",
      email: "john.bamenda@email.com",
      phone: "+237 678 901 234",
      resume: "john_bamenda_resume.pdf",
    },
    coverLetter:
      "My passion for user-centered design and experience with design thinking methodologies make me an ideal candidate for this position.",
  },
];

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-blue-100 text-blue-800",
          icon: Clock,
          dot: "bg-blue-500",
        };
      case "Interview":
        return {
          bg: "bg-purple-100 text-purple-800",
          icon: Eye,
          dot: "bg-purple-500",
        };
      case "Accepted":
        return {
          bg: "bg-green-100 text-green-800",
          icon: CheckCircle,
          dot: "bg-green-500",
        };
      case "Rejected":
        return { bg: "bg-red-100 text-red-800", icon: X, dot: "bg-red-500" };
      default:
        return {
          bg: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
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
      {status}
    </div>
  );
};

const ViewModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {application.title}
            </h2>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Building size={16} /> {application.company}
            </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Application Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    Applied:{" "}
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{application.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>{application.duration}</span>
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {application.salary}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Your Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />{" "}
                  {application.userInfo.name}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />{" "}
                  {application.userInfo.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />{" "}
                  {application.userInfo.phone}
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    {application.userInfo.resume}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Current Status</h3>
            <StatusBadge status={application.status} />
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {application.coverLetter}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ application, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(application || {});
  useEffect(() => {
    if (application) setFormData(application);
  }, [application]);
  if (!isOpen || !application) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Edit Application
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position Title
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || ""}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Letter
            </label>
            <textarea
              value={formData.coverLetter || ""}
              onChange={(e) =>
                setFormData({ ...formData, coverLetter: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} /> Save Changes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppliedInternshipsPage() {
  const [applications, setApplications] = useState(appliedInternships);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    application: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    application: null,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (application) =>
    setViewModal({ isOpen: true, application });
  const handleEdit = (application) =>
    setEditModal({ isOpen: true, application });
  const handleDelete = async (id) => {
    // Prompt user for confirmation before deleting
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirmed) return;
    // If deletion involves a server/API call, do it here and await success
    // Example:
    // try {
    //   await deleteApplicationFromServer(id);
    // } catch (err) {
    //   alert("Failed to delete application. Please try again.");
    //   return;
    // }
    setApplications(applications.filter((app) => app.id !== id));
  };
  const handleSave = (updated) =>
    setApplications(
      applications.map((app) => (app.id === updated.id ? updated : app))
    );

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "Pending").length,
    interviews: applications.filter((app) => app.status === "Interview").length,
    accepted: applications.filter((app) => app.status === "Accepted").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`mb-8 transition-all duration-1000 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Applied Internships
          </h1>
          <p className="text-gray-600">
            Manage and track all your internship applications in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Applied</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.total}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Interviews</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.interviews}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Accepted</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {stats.accepted}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 transition-all duration-1000 delay-400 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search companies or positions..."
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
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Add Application
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.title}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Building size={14} /> {application.company}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Applied:{" "}
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> {application.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} /> {application.duration}
                  </div>
                  <div className="font-medium text-green-600">
                    {application.salary}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(application)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => handleEdit(application)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(application.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ViewModal
        application={viewModal.application}
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, application: null })}
      />
      <EditModal
        application={editModal.application}
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, application: null })}
        onSave={handleSave}
      />
    </div>
  );
}
