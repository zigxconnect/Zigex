// file: lib/types/program-lms.ts
// Types for the Program Learning Management System

/**
 * Curriculum Module - Stored locally to save database space
 */
export interface CurriculumModule {
    moduleNumber: number;
    title: string;
    description: string;
    durationWeeks: number;
    tutor: {
        name: string;
        title: string; // e.g., "Senior Developer", "Industry Expert"
        avatarUrl?: string;
        linkedinUrl?: string;
        phone?: string; // WhatsApp contact
        email?: string;
    };
    topics: string[]; // List of topics covered in this module
}

/**
 * Program Curriculum - Full curriculum for a program
 */
export interface ProgramCurriculum {
    programId: string;
    programName: string;
    totalWeeks: number;
    modules: CurriculumModule[];
}

/**
 * Resource types for program content
 */
export type ResourceType = 'github' | 'pdf' | 'video' | 'assignment' | 'link' | 'other';

/**
 * Resource item in program content
 */
export interface ProgramResource {
    type: ResourceType;
    title: string;
    url: string;
    description?: string;
    dueDate?: string; // ISO date string for assignments
}

/**
 * Program Content - Dynamic weekly updates stored in database
 */
export interface ProgramContent {
    id: string;
    programId: string;
    weekNumber: number | null;
    title: string;
    description: string | null;
    content: string | null; // Markdown content
    resources: ProgramResource[];
    isPublished: boolean;
    notifyPaidUsers: boolean;

    // Session Details
    sessionType?: 'online' | 'onsite' | 'mixed';
    sessionLink?: string;
    sessionLocation?: string;
    sessionTime?: string;

    notifiedAt: string | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Application with payment status
 */
export interface ApplicationWithPayment {
    id: string;
    studentId: string;
    programId: string | null;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'rsvp_confirmed';
    applicationType: 'internship' | 'program' | 'event';
    isPaid: boolean;
    createdAt: string;
}

/**
 * Student's view of their enrolled program
 */
export interface EnrolledProgram {
    applicationId: string;
    programId: string;
    programTitle: string;
    programDescription?: string;
    programPictureUrl?: string;
    status: 'accepted' | 'pending' | 'reviewed';
    isPaid: boolean;
    companyName: string;
    companyLogoUrl?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Payment guide step for Mobile Money (Cameroon)
 */
export interface PaymentStep {
    stepNumber: number;
    title: string;
    description: string;
    icon?: string; // Lucide icon name
}

/**
 * Mobile Money payment info for Cameroon
 */
export interface MobileMoneyPaymentInfo {
    provider: 'MTN' | 'Orange';
    phoneNumber: string;
    accountName: string;
    amount: number;
    currency: 'XAF';
    steps: PaymentStep[];
}
