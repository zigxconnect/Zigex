// lib/data/intern-curriculum.ts

export interface CurriculumModule {
    id: string;
    title: string;
    description: string;
    topics: string[];
    project: {
        title: string;
        description: string;
        deliverables: string[];
    };
    duration: string;
    video_url?: string;
    resources?: { title: string; url: string }[];
}

export interface InternCurriculum {
    domain: string;
    level: string;
    modules: CurriculumModule[];
}

export const ZIGEX_DEFAULT_CURRICULA: InternCurriculum[] = [
    // WEB DEVELOPMENT
    {
        domain: "Web Development",
        level: "beginner",
        modules: [
            {
                id: "web-beg-1",
                title: "Frontend Foundations",
                description: "Master HTML5 and CSS3 to build responsive layouts.",
                topics: ["Semantic HTML", "Flexbox/Grid", "Responsive Design"],
                duration: "2 Weeks",
                project: {
                    title: "Portfolio site",
                    description: "Build a multi-page personal portfolio.",
                    deliverables: ["Responsive Navbar", "Contact Form", "Project Grid"]
                }
            },
            {
                id: "web-beg-2",
                title: "JavaScript Basics",
                description: "Learn core logic and DOM manipulation.",
                topics: ["Functions", "Arrays", "Event Listeners"],
                duration: "2 Weeks",
                project: {
                    title: "Weather App",
                    description: "Build an app that consumes a weather API.",
                    deliverables: ["API Integration", "Dynamic UI", "Error Handling"]
                }
            }
        ]
    },
    {
        domain: "Web Development",
        level: "intermediate",
        modules: [
            {
                id: "web-int-1",
                title: "React & Next.js",
                description: "Build modern web apps with component-based architecture.",
                topics: ["Hooks", "SSR/ISR", "Server Actions"],
                duration: "3 Weeks",
                project: {
                    title: "Blog Platform",
                    description: "Full-stack blog with CMS integration.",
                    deliverables: ["Dynamic Routes", "Comment System", "Auth"]
                }
            }
        ]
    },
    {
        domain: "Web Development",
        level: "advanced",
        modules: [
            {
                id: "web-adv-1",
                title: "SaaS Architecture",
                description: "Scale applications with multi-tenancy and high performance.",
                topics: ["Performance Tuning", "Caching", "Complex State"],
                duration: "4 Weeks",
                project: {
                    title: "Payment Gateway Integration",
                    description: "Build a subscription-based dashboard.",
                    deliverables: ["Stripe Webhooks", "Database Migrations", "Real-time Analytics"]
                }
            }
        ]
    },
    // MOBILE DEVELOPMENT
    {
        domain: "Mobile Development",
        level: "beginner",
        modules: [
            {
                id: "mob-beg-1",
                title: "Native UI & Basics",
                description: "Learn React Native or Flutter fundamentals.",
                topics: ["View/Text", "Styling", "Navigation"],
                duration: "2 Weeks",
                project: {
                    title: "Recipe App",
                    description: "Simple app to browse and save recipes.",
                    deliverables: ["FlatList Rendering", "Detail Views", "Save Functionality"]
                }
            }
        ]
    },
    {
        domain: "Mobile Development",
        level: "intermediate",
        modules: [
            {
                id: "mob-int-1",
                title: "Offline Sync & APIs",
                description: "Master device features and data persistence.",
                topics: ["SQLite", "Biometrics", "Native Modules"],
                duration: "3 Weeks",
                project: {
                    title: "Finance Tracker",
                    description: "Personal finance app with offline support.",
                    deliverables: ["Local Storage", "Charts/Graphs", "Expo APIs"]
                }
            }
        ]
    },
    // DATA SCIENCE
    {
        domain: "Data Science",
        level: "beginner",
        modules: [
            {
                id: "data-beg-1",
                title: "Python for Data",
                description: "Learn NumPy, Pandas, and Matplotlib for data processing.",
                topics: ["Data cleaning", "Indexing", "Basic Plots"],
                duration: "2 Weeks",
                project: {
                    title: "Sales Report Generator",
                    description: "Automate reporting from raw Excel data.",
                    deliverables: ["Cleaned Dataset", "Visual Dashboard", "PDF Export"]
                }
            }
        ]
    },
    // UI/UX DESIGN
    {
        domain: "UI/UX Design",
        level: "beginner",
        modules: [
            {
                id: "uiux-beg-1",
                title: "Visual Design Core",
                description: "Principles of contrast, white space, and hierarchy.",
                topics: ["Figma Basics", "Typography", "Color Psychology"],
                duration: "2 Weeks",
                project: {
                    title: "App Redesign",
                    description: "Re-imagine the Zigex landing page.",
                    deliverables: ["Wireframes", "Moodboard", "High-fidelity Prototype"]
                }
            }
        ]
    },
    // CYBERSECURITY
    {
        domain: "Cybersecurity",
        level: "beginner",
        modules: [
            {
                id: "sec-beg-1",
                title: "Network Security",
                description: "Learn how data travels and how to secure connections.",
                topics: ["TCP/IP", "Firewalls", "VPNs"],
                duration: "2 Weeks",
                project: {
                    title: "Network Audit",
                    description: "Identify vulnerabilities in a sample network.",
                    deliverables: ["Vulnerability Scan", "Security Report", "Risk Mitigation Plan"]
                }
            }
        ]
    },
    // DIGITAL MARKETING
    {
        domain: "Digital Marketing",
        level: "beginner",
        modules: [
            {
                id: "dm-beg-1",
                title: "SEO Foundations",
                description: "Drive organic traffic through search engine optimization.",
                topics: ["Keyword Research", "On-page SEO", "Google Analytics"],
                duration: "2 Weeks",
                project: {
                    title: "SEO Strategy",
                    description: "Create an SEO plan for a local business.",
                    deliverables: ["Keyword Map", "Content Calendar", "Backlink Analysis"]
                }
            }
        ]
    },
    // EMBEDDED SYSTEMS
    {
        domain: "Embedded Systems & IOT",
        level: "beginner",
        modules: [
            {
                id: "emb-beg-1",
                title: "Arduino & C++",
                description: "Program microcontrollers to interact with the world.",
                topics: ["GPIO Control", "Sensors", "Interrupts"],
                duration: "2 Weeks",
                project: {
                    title: "Smart Thermostat",
                    description: "Control temperature via a mobile interface.",
                    deliverables: ["Schematic Design", "Working Code", "IoT Cloud Sync"]
                }
            }
        ]
    }
];

export function getInternCurriculum(domain: string, level: string): InternCurriculum | null {
    if (!domain) return null;
    const normalizedDomain = domain.toLowerCase();
    const normalizedLevel = (level || "beginner").toLowerCase();

    // Specific match
    let curriculum = ZIGEX_DEFAULT_CURRICULA.find(c =>
        (normalizedDomain.includes(c.domain.toLowerCase()) ||
            c.domain.toLowerCase().includes(normalizedDomain)) &&
        c.level.toLowerCase() === normalizedLevel
    );

    if (curriculum) return curriculum;

    // Domain match only (default to beginner)
    curriculum = ZIGEX_DEFAULT_CURRICULA.find(c =>
        (normalizedDomain.includes(c.domain.toLowerCase()) ||
            c.domain.toLowerCase().includes(normalizedDomain)) &&
        c.level.toLowerCase() === "beginner"
    );

    return curriculum || ZIGEX_DEFAULT_CURRICULA[0]; // Final fallback
}
