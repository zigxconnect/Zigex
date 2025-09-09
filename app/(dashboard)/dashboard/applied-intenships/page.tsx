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
  Save
} from "lucide-react";
import { FileUploadButton } from "@/components/ui/FileUploadButton";

// TypeScript types for application data
interface Internship {
  title?: string;
  company?: string;
  location?: string;
  duration?: string;
  salary?: string;
}
interface ApplicationForm {
  support_letter_url?: string;
  cover_letter_url?: string;
}
interface Application {
  id: number;
  status: string;
  created_at?: string;
  internship?: Internship;
  form?: ApplicationForm;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-blue-100 text-blue-800", icon: Clock, dot: "bg-blue-500" };
      case "Interview":
        return { bg: "bg-purple-100 text-purple-800", icon: Eye, dot: "bg-purple-500" };
      case "Accepted":
        return { bg: "bg-green-100 text-green-800", icon: CheckCircle, dot: "bg-green-500" };
      case "Rejected":
        return { bg: "bg-red-100 text-red-800", icon: X, dot: "bg-red-500" };
      default:
        return { bg: "bg-gray-100 text-gray-800", icon: AlertCircle, dot: "bg-gray-500" };
    }
  };

  const config = getStatusConfig(status);
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {status}
    </div>
  );
};

const ViewModal = ({ application, isOpen, onClose }: { application: Application | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !application) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              <Eye size={24} className="text-blue-500" />
              Application Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Internship: <span className="font-semibold text-blue-800">{application.internship?.title || "Internship"}</span>
            </p>
            <p className="text-xs text-gray-500">Company: {application.internship?.company || "Company"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        {/* Main Content */}
        <div className="p-6 space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={16} className="text-blue-400" />
                <span>Applied: {application.created_at ? new Date(application.created_at).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin size={16} className="text-blue-400" />
                <span>{application.internship?.location || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock size={16} className="text-blue-400" />
                <span>{application.internship?.duration || "-"}</span>
              </div>
              <div className="font-semibold text-green-600 text-sm">{application.internship?.salary || ""}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                <span className="font-semibold">Status:</span>
                <StatusBadge status={application.status || "Pending"} />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Cover Letter
            </h3>
            {application.form?.cover_letter_url ? (
              <a href={application.form.cover_letter_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline">
                <FileText size={16} /> View submitted PDF
              </a>
            ) : (
              <span className="text-gray-500">No cover letter submitted.</span>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" /> Support Letter
            </h3>
            {application.form?.support_letter_url ? (
              <a href={application.form.support_letter_url} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-indigo-700 font-medium hover:underline">
                <FileText size={16} /> View submitted PDF
              </a>
            ) : (
              <span className="text-gray-500">No support letter submitted.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({ application, isOpen, onClose, onSave }: { application: Application | null, isOpen: boolean, onClose: () => void, onSave: (updated: Application) => void }) => {
  const [formData, setFormData] = useState<Application | null>(application);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [supportLetterFile, setSupportLetterFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (application) {
      setFormData(application);
      setCoverLetterFile(null);
      setSupportLetterFile(null);
    }
  }, [application]);
  if (!isOpen || !application || !formData) return null;

  const validateFile = (file: File | null, required: boolean) => {
    if (!file) return !required;
    if (file.size > MAX_FILE_SIZE_BYTES) return false;
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) return false;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    if (!validateFile(coverLetterFile, true)) {
      setError("Cover letter must be a PDF and max 2MB.");
      setSaving(false);
      return;
    }
    if (supportLetterFile && !validateFile(supportLetterFile, false)) {
      setError("Support letter must be a PDF and max 2MB.");
      setSaving(false);
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("application_id", String(formData.id));
      formDataToSend.append("status", formData.status);
      if (coverLetterFile) formDataToSend.append("cover_letter_file", coverLetterFile);
      if (supportLetterFile) formDataToSend.append("support_letter_file", supportLetterFile);
      const res = await fetch("/api/students/applications/manual", {
        method: "PUT",
        body: formDataToSend,
      });
      if (!res.ok) throw new Error("Failed to update application");
      onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Application</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="Pending">Pending</option>
              <option value="Interview">Interview</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (PDF, Max 2MB)</label>
            <FileUploadButton value={coverLetterFile} onChange={setCoverLetterFile} />
            {formData.form?.cover_letter_url && (
              <a href={formData.form.cover_letter_url} target="_blank" rel="noopener" className="text-blue-600 text-xs mt-2 block">View current file</a>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Letter (Optional PDF, Max 2MB)</label>
            <FileUploadButton value={supportLetterFile} onChange={setSupportLetterFile} />
            {formData.form?.support_letter_url && (
              <a href={formData.form.support_letter_url} target="_blank" rel="noopener" className="text-blue-600 text-xs mt-2 block">View current file</a>
            )}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AppliedInternshipsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; application: Application | null }>({ isOpen: false, application: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; application: Application | null }>({ isOpen: false, application: null });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/students/applications");
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = (app.internship?.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.internship?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'Pending').length,
    interviews: applications.filter(app => app.status === 'Interview').length,
    accepted: applications.filter(app => app.status === 'Accepted').length,
  };

  const handleView = (application: Application) => setViewModal({ isOpen: true, application });
  const handleEdit = (application: Application) => setEditModal({ isOpen: true, application });
  const handleDelete = (id: number) => setApplications(applications.filter(app => app.id !== id));
  const handleSave = (updated: Application) => setApplications(applications.map(app => app.id === updated.id ? updated : app));

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Applied Internships</h1>
          <p className="text-gray-600">Manage and track all your internship applications in one place</p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Applied</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Pending</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Eye className="w-5 h-5 text-purple-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Interviews</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.interviews}</p></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div className="ml-4"><p className="text-sm font-medium text-gray-500">Accepted</p><p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.accepted}</p></div>
          </div>
        </div>

        {/* Filters */}
        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 transition-all duration-1000 delay-400 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search companies or positions..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus size={16} /> Add Application</button>
          </div>
        </div>

        {/* Applications List */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-600 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{app.internship?.title || "Internship"}</h3>
                    <p className="text-gray-600 flex items-center gap-2"><Building size={14} /> {app.internship?.company || "Company"}</p>
                  </div>
                  <StatusBadge status={app.status || "Pending"} />
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2"><Calendar size={14} /> Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}</div>
                  <div className="flex items-center gap-2"><MapPin size={14} /> {app.internship?.location || "-"}</div>
                  <div className="flex items-center gap-2"><Clock size={14} /> {app.internship?.duration || "-"}</div>
                  <div className="font-medium text-green-600">{app.internship?.salary || ""}</div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button onClick={() => handleView(app)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"><Eye size={14} /> View</button>
                  <button onClick={() => handleEdit(app)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"><Edit3 size={14} /> Edit</button>
                  <button onClick={() => handleDelete(app.id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <ViewModal application={viewModal.application} isOpen={viewModal.isOpen} onClose={() => setViewModal({ isOpen: false, application: null })} />
        <EditModal application={editModal.application} isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, application: null })} onSave={handleSave} />
      </div>
    </main>
  );
}