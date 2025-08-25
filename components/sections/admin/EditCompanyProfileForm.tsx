"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/uiComponenet/Textarea";

// A simple form field wrapper for styling
const FormField = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        {children}
    </div>
);

export const EditCompanyProfileForm = ({ initialData }) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // THE FIX: State now matches your database schema exactly
    const [formData, setFormData] = useState({
        company_name: initialData.company_name || "",
        industry: initialData.industry || "",
        description: initialData.description || "",
        location: initialData.location || "",
        logo_url: initialData.logo_url || "",
        cover_image_url: initialData.cover_image_url || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/companies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to update profile.');
            }

            toast.success('Profile updated successfully!');
            // Refresh server components to show updated data in the sidebar and images
            router.refresh(); 

        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Company Name">
                    <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Your official company name" required />
                </FormField>
                
                <FormField label="Industry">
                    <Input name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g., Technology, Finance" />
                </FormField>
            </div>
            
            <FormField label="Location">
                <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Bamenda, Cameroon" />
            </FormField>
            
            <FormField label="Logo Image URL">
                <Input name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://.../logo.png" />
            </FormField>
            
            <FormField label="Cover Image URL">
                <Input name="cover_image_url" value={formData.cover_image_url} onChange={handleChange} placeholder="https://.../cover.png" />
            </FormField>
            
            <FormField label="Company Description">
                <Textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Tell us about your company..." />
            </FormField>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" variant="orange" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
};