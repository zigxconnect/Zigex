"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical,
  User,
  Mail,
  Phone,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  Loader2,
  Shield,
  UserPlus,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  searchEligibleUsers,
  promoteToSupervisor,
  removeSupervisor,
  updateSupervisorProfile
} from "@/lib/actions/supervisor.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SupervisorManagementClientProps {
  supervisors: any[];
  companyId: string;
}

export function SupervisorManagementClient({ supervisors, companyId }: SupervisorManagementClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const filteredSupervisors = supervisors.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [supervisorToDelete, setSupervisorToDelete] = useState<any>(null);

  const handleRemoveClick = (supervisor: any) => {
    setSupervisorToDelete(supervisor);
  };

  const confirmRemoveSupervisor = async () => {
    if (!supervisorToDelete) return;

    setIsLoading(true);
    try {
      const result = await removeSupervisor(supervisorToDelete.id);
      if (result.success) {
        toast.success(`${supervisorToDelete.full_name} removed from supervisors`);
        router.refresh();
        setSupervisorToDelete(null);
      } else {
        toast.error(result.error || "Failed to remove supervisor");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };



  const handleEditClick = (supervisor: any) => {
    setSelectedSupervisor(supervisor);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Add Supervisor Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddSupervisorModal 
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            companyId={companyId}
          />
        )}
      </AnimatePresence>

      {/* Edit Supervisor Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedSupervisor && (
          <EditSupervisorModal 
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedSupervisor(null);
            }}
            supervisor={selectedSupervisor}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-blue-100/50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <Badge className="bg-blue-600 text-white border-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2">
                Admin Panel
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Supervisor Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage mentors who guide your interns
              </p>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 px-5 font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <UserPlus size={16} className="mr-2" />
              Add Supervisor
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5">
            <Users size={18} className="text-blue-600 mb-3" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Total Supervisors</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{supervisors.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5">
            <Shield size={18} className="text-green-500 mb-3" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Active Mentors</p>
            <p className="text-2xl font-bold text-green-600">
              {supervisors.filter(s => s.assigned_interns?.[0]?.count > 0).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-5 col-span-2 sm:col-span-1">
            <User size={18} className="text-amber-500 mb-3" />
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Without Assignment</p>
            <p className="text-2xl font-bold text-amber-600">
              {supervisors.filter(s => !s.assigned_interns?.[0]?.count).length}
            </p>
          </div>
        </div>

        {/* Supervisors List */}
        <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-blue-50 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Supervisors</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input 
                  placeholder="Search supervisors..." 
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-slate-100 bg-slate-50 focus:bg-white text-sm w-full sm:w-64"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-blue-50 dark:divide-slate-800">
            {filteredSupervisors.length > 0 ? filteredSupervisors.map((supervisor) => {
              const internCount = supervisor.assigned_interns?.[0]?.count || 0;
              
              return (
                <div key={supervisor.id} className="group flex items-center gap-4 p-4 sm:p-5 hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-sm shrink-0 bg-gradient-to-br from-blue-600 to-blue-700">
                    {supervisor.avatar_url ? (
                      <Image 
                        src={supervisor.avatar_url} 
                        alt={supervisor.full_name} 
                        width={48} 
                        height={48} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {supervisor.full_name?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {supervisor.full_name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                      <Mail size={10} /> {supervisor.email}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-3">
                    {supervisor.field_expertise?.length > 0 && (
                      <div className="flex gap-1">
                        {supervisor.field_expertise.slice(0, 2).map((field: string, i: number) => (
                          <Badge key={i} className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-medium rounded-md">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Badge className={cn(
                      "text-[10px] font-semibold rounded-md",
                      internCount > 0 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                      {internCount} Intern{internCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0 text-slate-400 hover:text-slate-600">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem onClick={() => handleEditClick(supervisor)} className="rounded-lg">
                        <Edit2 size={14} className="mr-2" /> Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemoveClick(supervisor)}
                        className="rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 size={14} className="mr-2" /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <Users size={40} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No supervisors found</p>
                <p className="text-xs text-slate-400 mt-1">Add your first supervisor to get started</p>
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 h-10 px-5 font-semibold text-xs"
                >
                  <UserPlus size={14} className="mr-2" /> Add Supervisor
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ===== ADD SUPERVISOR MODAL =====
function AddSupervisorModal({ isOpen, onClose, companyId }: { isOpen: boolean; onClose: () => void; companyId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchEligibleUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  const handlePromote = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const result = await promoteToSupervisor({
        user_id: selectedUser.user_id,
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        avatar_url: selectedUser.avatar_url,
        company_id: companyId
      });

      if (result.success) {
        toast.success(`🎉 Welcome email sent! ${selectedUser.full_name} is now a supervisor.`);
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add supervisor");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-blue-100 dark:border-slate-800"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <UserPlus size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add Supervisor</h2>
                <p className="text-xs text-blue-100/80">Identify existing users to promote</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="min-h-[250px] max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {isSearching ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selectedUser?.user_id === user.user_id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shrink-0">
                    {user.avatar_url ? (
                      <Image src={user.avatar_url} alt={user.full_name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  {selectedUser?.user_id === user.user_id && (
                    <CheckCircle2 size={18} className="text-blue-600 shrink-0" />
                  )}
                </button>
              ))
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-10">
                <User size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No users found</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <Search size={32} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Type to search for users</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 flex gap-3">
          <Button onClick={onClose} variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600">
            Cancel
          </Button>
          <Button 
            onClick={handlePromote}
            disabled={!selectedUser || isSubmitting}
            className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-12 font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin mr-2" size={16} /> Processing...</>
            ) : (
              <><Shield size={16} className="mr-2" /> Make Supervisor</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ===== EDIT SUPERVISOR MODAL =====
function EditSupervisorModal({ isOpen, onClose, supervisor }: { isOpen: boolean; onClose: () => void; supervisor: any }) {
  const [fullName, setFullName] = useState(supervisor.full_name || "");
  const [bio, setBio] = useState(supervisor.bio || "");
  const [expertise, setExpertise] = useState(supervisor.field_expertise?.join(", ") || "");
  const [whatsapp, setWhatsapp] = useState(supervisor.whatsapp || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateSupervisorProfile(supervisor.id, {
        full_name: fullName,
        bio,
        field_expertise: expertise.split(",").map((e: string) => e.trim()).filter(Boolean),
        whatsapp,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden border border-blue-100 dark:border-slate-800"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/20 backdrop-blur-md">
                {supervisor.avatar_url ? (
                  <Image src={supervisor.avatar_url} alt={supervisor.full_name} width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center font-bold">{fullName.charAt(0)}</div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">Edit Supervisor</h2>
                <p className="text-xs text-blue-100/80">{supervisor.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short description..." className="rounded-xl min-h-[80px] resize-none" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Expertise (comma-separated)</label>
            <Input value={expertise} onChange={(e) => setExpertise(e.target.value)} placeholder="React, Node.js, Python" className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">WhatsApp Number</label>
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+237..." className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl h-11 font-semibold text-xs">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 h-11 font-semibold text-xs shadow-md shadow-blue-500/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin mr-1.5" size={14} /> : <CheckCircle2 size={14} className="mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
// ===== DELETE SUPERVISOR MODAL =====
function DeleteSupervisorModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  supervisorName, 
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  supervisorName: string;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30"
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <Trash2 size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Remove Supervisor?
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{supervisorName}</strong>? 
            They will be unassigned from all current interns. This action cannot be undone.
          </p>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white h-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              Yes, Remove
            </Button>
            
            <Button 
              onClick={onClose} 
              variant="ghost" 
              className="w-full rounded-xl h-12 font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
