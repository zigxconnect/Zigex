// file: lib/data/program-curriculum.ts
// Local curriculum data for programs - saves database space!

import { ProgramCurriculum, MobileMoneyPaymentInfo, PaymentStep } from '@/lib/types/program-lms';

/**
 * CURRICULUM DATA
 * Store curriculum locally to save database space.
 * Each program can have its own curriculum defined here.
 * 
 * To add a new program curriculum:
 * 1. Add a new entry with the program's database ID as the key
 * 2. Define the modules with tutors
 */

export const PROGRAM_CURRICULA: Record<string, ProgramCurriculum> = {
    // Example: Weekend of Code program
    'weekend-of-code': {
        programId: 'weekend-of-code',
        programName: 'Weekend of Code',
        totalWeeks: 52,
        modules: [
            {
                moduleNumber: 1,
                title: 'Professional Development & Career',
                description: 'Build your personal brand, CV, and learn how to navigate the tech job market.',
                durationWeeks: 4,
                tutor: {
                    name: 'Jean Pierre Kamga',
                    title: 'Career Coach',
                    avatarUrl: '/tutors/jean-pierre.jpg',
                    linkedinUrl: 'https://linkedin.com/in/jeanpierrekamga',
                    phone: '+237 670 123 456',
                    email: 'careers@zigexconnect.com',
                },
                topics: [
                    'CV & Resume Building',
                    'LinkedIn Optimization',
                    'Interview Preparation',
                    'Networking Strategies',
                ],
            },
            {
                moduleNumber: 2,
                title: 'Project Management',
                description: 'Learn Agile, Scrum, and how to manage software projects effectively.',
                durationWeeks: 5,
                tutor: {
                    name: 'Marie Claire Nguema',
                    title: 'Project Manager',
                    avatarUrl: '/tutors/marie-claire.jpg',
                    linkedinUrl: 'https://linkedin.com/in/marieclaireguema',
                    phone: '+237 691 234 567',
                    email: 'marieclaire@zigexconnect.com',
                },
                topics: [
                    'Agile Methodology',
                    'Scrum Framework',
                    'Jira & Trello',
                    'Team Collaboration',
                ],
            },
            {
                moduleNumber: 3,
                title: 'Version Control Systems (Git)',
                description: 'Master source code management and collaborative development.',
                durationWeeks: 3,
                tutor: {
                    name: 'Paul Olivier Tchinda',
                    title: 'DevOps Engineer',
                    avatarUrl: '/tutors/paul-olivier.jpg',
                    linkedinUrl: 'https://linkedin.com/in/pauloliviertchinda',
                    phone: '+237 677 345 678',
                    email: 'paulolivier@zigexconnect.com',
                },
                topics: [
                    'Git Fundamentals',
                    'Branching & Merging',
                    'GitHub Workflows',
                    'Pull Requests',
                ],
            },
            {
                moduleNumber: 4,
                title: 'Programming Fundamentals',
                description: 'Core concepts of algorithms, data structures, and problem solving.',
                durationWeeks: 8,
                tutor: {
                    name: 'Emmanuel Fotso',
                    title: 'Senior Software Engineer',
                    avatarUrl: '/tutors/emmanuel-fotso.jpg',
                    linkedinUrl: 'https://linkedin.com/in/emmanuelfotso',
                    phone: '+237 699 456 789',
                    email: 'emmanuelfotso@zigexconnect.com',
                },
                topics: [
                    'Algorithms & Logic',
                    'Data Structures',
                    'Object-Oriented Programming',
                    'Design Patterns',
                ],
            },
            {
                moduleNumber: 5,
                title: 'App Development (Mobile & Desktop)',
                description: 'Build cross-platform applications for modern devices.',
                durationWeeks: 9,
                tutor: {
                    name: 'Sarah Mbi',
                    title: 'Mobile Developer',
                    avatarUrl: '/tutors/sarah-mbi.jpg',
                    linkedinUrl: 'https://linkedin.com/in/sarahmbi',
                    phone: '+237 655 444 333',
                    email: 'sarah@zigexconnect.com',
                },
                topics: [
                    'React Native / Flutter',
                    'Mobile UI/UX',
                    'State Management',
                    'App Store Deployment',
                ],
            },
            {
                moduleNumber: 6,
                title: 'Web Development',
                description: 'Full-stack web development from frontend to backend.',
                durationWeeks: 10,
                tutor: {
                    name: 'Kevin Nana',
                    title: 'Full Stack Developer',
                    avatarUrl: '/tutors/kevin-nana.jpg',
                    linkedinUrl: 'https://linkedin.com/in/kevinnana',
                    phone: '+237 677 888 999',
                    email: 'kevin@zigexconnect.com',
                },
                topics: [
                    'HTML5, CSS3, JavaScript',
                    'React / Next.js',
                    'Node.js & Express',
                    'Database Design',
                ],
            },
            {
                moduleNumber: 7,
                title: 'Machine Learning Fundamentals',
                description: 'Introduction to AI, ML models, and data science.',
                durationWeeks: 8,
                tutor: {
                    name: 'Dr. Alan Turing',
                    title: 'AI Researcher',
                    avatarUrl: '/tutors/alan-turing.jpg',
                    linkedinUrl: 'https://linkedin.com/in/alanturing',
                    phone: '+237 600 000 000',
                    email: 'ai@zigexconnect.com',
                },
                topics: [
                    'Python for Data Science',
                    'Supervised Learning',
                    'Neural Networks',
                    'Model Training',
                ],
            },
            {
                moduleNumber: 8,
                title: 'Cybersecurity Essentials',
                description: 'Protecting systems, networks, and programs from digital attacks.',
                durationWeeks: 6,
                tutor: {
                    name: 'Alice Security',
                    title: 'Security Analyst',
                    avatarUrl: '/tutors/alice-sec.jpg',
                    linkedinUrl: 'https://linkedin.com/in/alicesec',
                    phone: '+237 611 111 222',
                    email: 'security@zigexconnect.com',
                },
                topics: [
                    'Network Security',
                    'Ethical Hacking Basics',
                    'Cryptography',
                    'Security Best Practices',
                ],
            },
        ],
    },

    // Add more program curricula here as needed
    // 'program-uuid-here': { ... }
};

/**
 * Get curriculum for a specific program
 * @param programId - The program's database ID or slug
 * @param programTitle - Optional program title for fuzzy matching
 * @returns The curriculum or null if not found
 */
export function getProgramCurriculum(programId: string, programTitle?: string): ProgramCurriculum | null {
    // Try direct match first by key
    if (PROGRAM_CURRICULA[programId]) {
        return PROGRAM_CURRICULA[programId];
    }

    // Try matching by programId field
    let curriculum = Object.values(PROGRAM_CURRICULA).find(
        (c) => c.programId === programId
    );
    if (curriculum) return curriculum;

    // Try matching by program name (case insensitive, partial match)
    if (programTitle) {
        const lowerTitle = programTitle.toLowerCase();
        curriculum = Object.values(PROGRAM_CURRICULA).find(
            (c) => lowerTitle.includes(c.programName.toLowerCase()) ||
                c.programName.toLowerCase().includes(lowerTitle)
        );
        if (curriculum) return curriculum;
    }

    // Try matching by slug derived from title
    // e.g., "SEED WEEKEND OF CODE 2025" -> "weekend-of-code"
    if (programTitle) {
        const possibleSlugs = [
            programTitle.toLowerCase().replace(/\s+/g, '-'),
            programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        ];

        for (const key of Object.keys(PROGRAM_CURRICULA)) {
            for (const slug of possibleSlugs) {
                if (slug.includes(key) || key.includes(slug.split('-').slice(0, 3).join('-'))) {
                    return PROGRAM_CURRICULA[key];
                }
            }
        }
    }

    // Default fallback: return the first curriculum if only one exists
    const allCurricula = Object.values(PROGRAM_CURRICULA);
    if (allCurricula.length === 1) {
        return allCurricula[0];
    }

    return null;
}

/**
 * Get all available curricula
 */
export function getAllCurricula(): ProgramCurriculum[] {
    return Object.values(PROGRAM_CURRICULA);
}

/**
 * MOBILE MONEY PAYMENT INFORMATION (Cameroon)
 * Payment guide for students to complete their program payment
 */
export const MOBILE_MONEY_PAYMENT_INFO: MobileMoneyPaymentInfo[] = [
    {
        provider: 'MTN',
        phoneNumber: '670 000 000', // Replace with actual number
        accountName: 'ZIGEX CONNECT',
        amount: 10000, // XAF
        currency: 'XAF',
        steps: [
            {
                stepNumber: 1,
                title: 'Dial MTN Mobile Money',
                description: 'Dial *126# on your MTN line to access Mobile Money menu.',
                icon: 'Phone',
            },
            {
                stepNumber: 2,
                title: 'Select Transfer',
                description: 'Choose option 1: "Transfer Money" from the main menu.',
                icon: 'Send',
            },
            {
                stepNumber: 3,
                title: 'Enter Recipient Number',
                description: 'Enter 670 000 000 (ZIGEX CONNECT) as the recipient.',
                icon: 'UserPlus',
            },
            {
                stepNumber: 4,
                title: 'Enter Amount',
                description: 'Enter the amount: 10,000 XAF for monthly access.',
                icon: 'Wallet',
            },
            {
                stepNumber: 5,
                title: 'Confirm with PIN',
                description: 'Enter your Mobile Money PIN to confirm the transaction.',
                icon: 'Lock',
            },
            {
                stepNumber: 6,
                title: 'Save Transaction ID',
                description: 'Note your transaction ID from the SMS confirmation. Share it with us for verification.',
                icon: 'FileCheck',
            },
        ],
    },
    {
        provider: 'Orange',
        phoneNumber: '699 000 000', // Replace with actual number
        accountName: 'ZIGEX CONNECT',
        amount: 10000, // XAF
        currency: 'XAF',
        steps: [
            {
                stepNumber: 1,
                title: 'Dial Orange Money',
                description: 'Dial #150# on your Orange line to access Orange Money.',
                icon: 'Phone',
            },
            {
                stepNumber: 2,
                title: 'Select Transfer',
                description: 'Choose option 1: "Transfer" from the main menu.',
                icon: 'Send',
            },
            {
                stepNumber: 3,
                title: 'Enter Recipient Number',
                description: 'Enter 699 000 000 (ZIGEX CONNECT) as the recipient.',
                icon: 'UserPlus',
            },
            {
                stepNumber: 4,
                title: 'Enter Amount',
                description: 'Enter the amount: 10,000 XAF for monthly access.',
                icon: 'Wallet',
            },
            {
                stepNumber: 5,
                title: 'Confirm with PIN',
                description: 'Enter your Orange Money PIN to confirm the transaction.',
                icon: 'Lock',
            },
            {
                stepNumber: 6,
                title: 'Save Transaction ID',
                description: 'Note your transaction ID from the SMS confirmation. Share it with us for verification.',
                icon: 'FileCheck',
            },
        ],
    },
];

/**
 * Get payment info for a specific provider
 */
export function getPaymentInfo(provider: 'MTN' | 'Orange'): MobileMoneyPaymentInfo | undefined {
    return MOBILE_MONEY_PAYMENT_INFO.find((p) => p.provider === provider);
}

/**
 * Format amount in XAF
 */
export function formatXAF(amount: number): string {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency',
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
