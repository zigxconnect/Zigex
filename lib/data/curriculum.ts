// lib/data/curriculum.ts

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'reading' | 'assignment' | 'project';
    completed?: boolean;
}

export interface CurriculumModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    lessons: Lesson[];
}

export interface LevelCurriculum {
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    modules: CurriculumModule[];
}

export interface ProgramCurriculum {
    program: string;
    levels: LevelCurriculum[];
}

export const PROGRAM_CURRICULA: ProgramCurriculum[] = [
    {
        program: "Machine Learning & AI",
        levels: [
            {
                level: "Beginner",
                modules: [
                    {
                        id: "ai-beg-m1",
                        title: "Introduction to Artificial Intelligence",
                        description: "Understand the history, types, and real-world applications of AI.",
                        duration: "1 Week",
                        lessons: [
                            { id: "ai-beg-m1-l1", title: "What is AI? (History & Overview)", duration: "15 min", type: "video" },
                            { id: "ai-beg-m1-l2", title: "Narrow vs General AI", duration: "10 min", type: "reading" },
                            { id: "ai-beg-m1-l3", title: "Foundations of Neural Networks", duration: "25 min", type: "video" },
                            { id: "ai-beg-m1-l4", title: "Assignment: AI in Day-to-Day Life", duration: "45 min", type: "assignment" }
                        ]
                    },
                    {
                        id: "ai-beg-m2",
                        title: "Python for Data Science & ML",
                        description: "Master Python libraries required for data manipulation and visualization.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "ai-beg-m2-l1", title: "NumPy Fundamentals", duration: "30 min", type: "video" },
                            { id: "ai-beg-m2-l2", title: "Pandas: DataFrames and Series", duration: "45 min", type: "video" },
                            { id: "ai-beg-m2-l3", title: "Data Cleaning Techniques", duration: "20 min", type: "reading" },
                            { id: "ai-beg-m2-l4", title: "Visualization with Matplotlib & Seaborn", duration: "35 min", type: "video" },
                            { id: "ai-beg-m2-l5", title: "Project: Exploratory Data Analysis", duration: "2 hours", type: "project" }
                        ]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        id: "ai-int-m1",
                        title: "Supervised Learning Algorithms",
                        description: "Deep dive into regression and classification models.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-int-m1-l1", title: "Linear & Logistic Regression", duration: "50 min", type: "video" },
                            { id: "ai-int-m1-l2", title: "Decision Trees & Random Forests", duration: "40 min", type: "video" },
                            { id: "ai-int-m1-l3", title: "Support Vector Machines (SVM)", duration: "30 min", type: "reading" },
                            { id: "ai-int-m1-l4", title: "Model Evaluation Metrics (Precision/Recall)", duration: "25 min", type: "video" }
                        ]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        id: "ai-adv-m1",
                        title: "Deep Learning & Neural Networks",
                        description: "Building complex neural architectures with PyTorch/TensorFlow.",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-adv-m1-l1", title: "Backpropagation & Gradient Descent", duration: "60 min", type: "video" },
                            { id: "ai-adv-m1-l2", title: "Convolutional Neural Networks (CNN)", duration: "55 min", type: "video" },
                            { id: "ai-adv-m1-l3", title: "Recurrent Neural Networks (RNN)", duration: "45 min", type: "video" },
                            { id: "ai-adv-m1-l4", title: "Transformers & LLM Foundations", duration: "70 min", type: "video" },
                            { id: "ai-adv-m1-l5", title: "Capstone: Building a Custom GPT Model", duration: "10 hours", type: "project" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        program: "Web Development",
        levels: [
            {
                level: "Beginner",
                modules: [
                    {
                        id: "web-beg-m1",
                        title: "Modern HTML & CSS Foundations",
                        description: "Build the structure and style of modern websites.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "web-beg-m1-l1", title: "Semantic HTML5", duration: "20 min", type: "video" },
                            { id: "web-beg-m1-l2", title: "CSS Flexbox & Grid Masterclass", duration: "50 min", type: "video" },
                            { id: "web-beg-m1-l3", title: "Responsive Web Design", duration: "30 min", type: "reading" },
                            { id: "web-beg-m1-l4", title: "Project: Personal Portfolio Website", duration: "3 hours", type: "project" }
                        ]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        id: "web-int-m1",
                        title: "React & State Management",
                        description: "Building interactive user interfaces with React and Hooks.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "web-int-m1-l1", title: "React Fundamentals: Components & Props", duration: "40 min", type: "video" },
                            { id: "web-int-m1-l2", title: "Hooks: useState & useEffect", duration: "45 min", type: "video" },
                            { id: "web-int-m1-l3", title: "Global State with Context API", duration: "35 min", type: "video" },
                            { id: "web-int-m1-l4", title: "Integrating with REST APIs", duration: "40 min", type: "video" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        program: "Data Science",
        levels: [
            {
                level: "Beginner",
                modules: [
                    {
                        id: "ds-beg-m1",
                        title: "Statistical Foundations",
                        description: "Probability, distributions, and hypothesis testing for data analysis.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "ds-beg-m1-l1", title: "Descriptive Statistics", duration: "30 min", type: "video" },
                            { id: "ds-beg-m1-l2", title: "Probability Theory", duration: "45 min", type: "video" },
                            { id: "ds-beg-m1-l3", title: "Inferential Statistics", duration: "40 min", type: "reading" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        program: "Mobile App Development",
        levels: [
            {
                level: "Beginner",
                modules: [
                    {
                        id: "mob-beg-m1",
                        title: "Cross-Platform Frameworks",
                        description: "Introduction to React Native and Flutter architecture.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "mob-beg-m1-l1", title: "Mobile UI Design Principles", duration: "25 min", type: "video" },
                            { id: "mob-beg-m1-l2", title: "State Management in Mobile", duration: "50 min", type: "video" },
                            { id: "mob-beg-m1-l3", title: "Native Bridge and Modules", duration: "35 min", type: "reading" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        program: "Cybersecurity",
        levels: [
            {
                level: "Beginner",
                modules: [
                    {
                        id: "cyber-beg-m1",
                        title: "Security Essentials",
                        description: "Understanding threats, vulnerabilities, and defense mechanisms.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "cyber-beg-m1-l1", title: "Network Security Protocols", duration: "40 min", type: "video" },
                            { id: "cyber-beg-m1-l2", title: "Cryptography Basics", duration: "45 min", type: "video" },
                            { id: "cyber-beg-m1-l3", title: "Ethical Hacking Intro", duration: "50 min", type: "video" }
                        ]
                    }
                ]
            }
        ]
    }
];

export function getProgramCurriculum(programName: string): ProgramCurriculum | null {
    if (!programName) return null;

    // 1. Normalize both strings: lowercase, remove special chars, collapse spaces
    const normalize = (s: string) => s.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const searchStr = normalize(programName);

    // 2. Try exact normalized match
    let match = PROGRAM_CURRICULA.find(pc => normalize(pc.program) === searchStr);
    if (match) return match;

    // 3. Try partial inclusion (fuzzy)
    // Check if either string contains the core parts of the other
    match = PROGRAM_CURRICULA.find(pc => {
        const pcNorm = normalize(pc.program);
        // If search is "machine learning ai" and data is "machine learning ai", they match
        // If search is "machine learning" and data is "machine learning ai", it matches
        return searchStr.includes(pcNorm) || pcNorm.includes(searchStr);
    });

    if (match) return match;

    // 4. Fallback for specific common variations
    const aiKeywords = ["ai", "machine learning", "ml", "artificial intelligence"];
    if (aiKeywords.some(key => searchStr.includes(key))) {
        return PROGRAM_CURRICULA.find(pc => pc.program === "Machine Learning & AI") || null;
    }

    const webKeywords = ["web", "frontend", "backend", "fullstack", "full stack"];
    if (webKeywords.some(key => searchStr.includes(key))) {
        return PROGRAM_CURRICULA.find(pc => pc.program === "Web Development") || null;
    }

    return null;
}
