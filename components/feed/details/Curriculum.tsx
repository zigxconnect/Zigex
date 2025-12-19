"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Clock,
  FileText,
  Code,
  Zap,
  BookOpen,
  Target,
  Award,
} from "lucide-react";
import { Card } from "@/components/ui/card";

// Define curriculum sections with detailed subsections
const CURRICULUM_DATA = [
  {
    id: 1,
    title: "Professional Development & Career",
    duration: "4 weeks",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Introduction to Professional Development",
        duration: "2 hours",
        topics: [
          "Career planning fundamentals",
          "Goal setting and milestone tracking",
          "Industry trends and job market overview",
        ],
      },
      {
        lessonNum: 2,
        title: "Personal Branding & LinkedIn Mastery",
        duration: "2.5 hours",
        topics: [
          "Building a professional online presence",
          "LinkedIn profile optimization",
          "Creating compelling professional narratives",
        ],
      },
      {
        lessonNum: 3,
        title: "Resume & Cover Letter Crafting",
        duration: "3 hours",
        topics: [
          "Resume writing best practices",
          "ATS optimization techniques",
          "Cover letter strategies",
        ],
      },
      {
        lessonNum: 4,
        title: "Interview Preparation & Skills",
        duration: "3.5 hours",
        topics: [
          "Technical interview prep",
          "Behavioral interview techniques",
          "Negotiation and offer evaluation",
        ],
      },
    ],
    projects: [
      { name: "Personal Brand Portfolio", description: "Create your professional online presence" },
      { name: "Mock Interview Session", description: "Practice with industry experts" },
    ],
  },
  {
    id: 2,
    title: "Project Management",
    duration: "5 weeks",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Fundamentals of Project Management",
        duration: "2 hours",
        topics: [
          "Project lifecycle overview",
          "Stakeholder management",
          "Project constraints (scope, time, cost)",
        ],
      },
      {
        lessonNum: 2,
        title: "Agile & Scrum Methodology",
        duration: "3 hours",
        topics: [
          "Agile principles and manifesto",
          "Sprint planning and execution",
          "Daily standups and retrospectives",
        ],
      },
      {
        lessonNum: 3,
        title: "Tools & Technologies",
        duration: "2.5 hours",
        topics: [
          "Jira and project tracking tools",
          "Collaboration platforms",
          "Gantt charts and timeline management",
        ],
      },
      {
        lessonNum: 4,
        title: "Team Leadership & Communication",
        duration: "3 hours",
        topics: [
          "Effective team communication",
          "Conflict resolution",
          "Motivation and productivity",
        ],
      },
      {
        lessonNum: 5,
        title: "Real-world Project Case Studies",
        duration: "2 hours",
        topics: [
          "Case study analysis",
          "Lessons learned",
          "Best practices implementation",
        ],
      },
    ],
    projects: [
      { name: "Manage a Mini Project", description: "Plan and execute a 2-week sprint" },
      { name: "Team Collaboration Challenge", description: "Lead a cross-functional team" },
    ],
  },
  {
    id: 3,
    title: "Version Control Systems (Git & GitHub)",
    duration: "3 weeks",
    icon: Code,
    color: "from-orange-500 to-orange-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Git Basics & Installation",
        duration: "2 hours",
        topics: [
          "Understanding version control",
          "Local repository setup",
          "Commits and history tracking",
        ],
      },
      {
        lessonNum: 2,
        title: "Branching & Merging Strategies",
        duration: "2.5 hours",
        topics: [
          "Creating and managing branches",
          "Merge conflicts resolution",
          "Git workflows (GitFlow, GitHub Flow)",
        ],
      },
      {
        lessonNum: 3,
        title: "GitHub Collaboration",
        duration: "3 hours",
        topics: [
          "Remote repositories",
          "Pull requests and code review",
          "Collaborative development",
        ],
      },
    ],
    projects: [
      { name: "GitHub Collaboration Project", description: "Contribute to a team repository" },
      { name: "Conflict Resolution Drill", description: "Practice resolving merge conflicts" },
    ],
  },
  {
    id: 4,
    title: "Programming Fundamentals",
    duration: "8 weeks",
    icon: Zap,
    color: "from-green-500 to-green-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Programming Basics",
        duration: "3 hours",
        topics: [
          "Variables, data types, and operators",
          "Control flow (if-else, loops)",
          "Functions and scope",
        ],
      },
      {
        lessonNum: 2,
        title: "Object-Oriented Programming",
        duration: "4 hours",
        topics: [
          "Classes and objects",
          "Inheritance and polymorphism",
          "Encapsulation and abstraction",
        ],
      },
      {
        lessonNum: 3,
        title: "Data Structures & Algorithms",
        duration: "4 hours",
        topics: [
          "Arrays, linked lists, trees",
          "Sorting and searching algorithms",
          "Time and space complexity",
        ],
      },
      {
        lessonNum: 4,
        title: "Error Handling & Debugging",
        duration: "2.5 hours",
        topics: [
          "Exception handling",
          "Debugging techniques",
          "Testing and test-driven development",
        ],
      },
      {
        lessonNum: 5,
        title: "Problem Solving Techniques",
        duration: "3 hours",
        topics: [
          "Algorithmic thinking",
          "Code optimization",
          "Coding interview preparation",
        ],
      },
    ],
    projects: [
      { name: "Build a Calculator App", description: "Implement basic programming concepts" },
      { name: "Data Structure Implementation", description: "Create custom data structures" },
      { name: "Algorithm Challenge", description: "Solve coding problems" },
    ],
  },
  {
    id: 5,
    title: "App Development (Mobile & Desktop)",
    duration: "9 weeks",
    icon: Code,
    color: "from-cyan-500 to-cyan-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Mobile App Development Basics",
        duration: "3 hours",
        topics: [
          "Native vs cross-platform development",
          "React Native fundamentals",
          "Mobile UI/UX principles",
        ],
      },
      {
        lessonNum: 2,
        title: "State Management in Apps",
        duration: "3.5 hours",
        topics: [
          "Redux and Context API",
          "State persistence",
          "Real-time data handling",
        ],
      },
      {
        lessonNum: 3,
        title: "Native Platform Development",
        duration: "4 hours",
        topics: [
          "Swift for iOS",
          "Kotlin for Android",
          "Platform-specific features",
        ],
      },
      {
        lessonNum: 4,
        title: "App Deployment & Distribution",
        duration: "2.5 hours",
        topics: [
          "App store optimization",
          "Building and signing apps",
          "Publishing and updates",
        ],
      },
      {
        lessonNum: 5,
        title: "Cross-Platform Development",
        duration: "3 hours",
        topics: [
          "Flutter introduction",
          "Shared code practices",
          "Performance optimization",
        ],
      },
    ],
    projects: [
      { name: "Build a Todo Mobile App", description: "Create a full-featured mobile application" },
      { name: "Cross-Platform Weather App", description: "Deploy on iOS and Android" },
    ],
  },
  {
    id: 6,
    title: "Web Development",
    duration: "10 weeks",
    icon: FileText,
    color: "from-pink-500 to-pink-600",
    lessons: [
      {
        lessonNum: 1,
        title: "HTML5 & CSS3 Mastery",
        duration: "3 hours",
        topics: [
          "Semantic HTML",
          "Advanced CSS layouts",
          "Responsive design principles",
        ],
      },
      {
        lessonNum: 2,
        title: "JavaScript Fundamentals",
        duration: "4 hours",
        topics: [
          "ES6+ features",
          "Async programming",
          "DOM manipulation",
        ],
      },
      {
        lessonNum: 3,
        title: "Frontend Frameworks",
        duration: "5 hours",
        topics: [
          "React ecosystem",
          "Component architecture",
          "State management patterns",
        ],
      },
      {
        lessonNum: 4,
        title: "Backend Development",
        duration: "4.5 hours",
        topics: [
          "Node.js and Express",
          "RESTful APIs",
          "Database design and queries",
        ],
      },
      {
        lessonNum: 5,
        title: "Full-Stack Integration",
        duration: "3.5 hours",
        topics: [
          "Authentication and authorization",
          "Deployment strategies",
          "CI/CD pipelines",
        ],
      },
    ],
    projects: [
      { name: "Build an E-Commerce Website", description: "Full-stack web application" },
      { name: "Create a Social Media Platform", description: "Complex web application" },
      { name: "Portfolio Website", description: "Showcase your work" },
    ],
  },
  {
    id: 7,
    title: "Machine Learning Fundamentals",
    duration: "8 weeks",
    icon: Award,
    color: "from-red-500 to-red-600",
    lessons: [
      {
        lessonNum: 1,
        title: "ML Basics & Mathematics",
        duration: "3 hours",
        topics: [
          "Machine learning concepts",
          "Linear algebra essentials",
          "Statistics and probability",
        ],
      },
      {
        lessonNum: 2,
        title: "Supervised Learning",
        duration: "4 hours",
        topics: [
          "Regression and classification",
          "Decision trees and random forests",
          "Support vector machines",
        ],
      },
      {
        lessonNum: 3,
        title: "Unsupervised Learning",
        duration: "3.5 hours",
        topics: [
          "Clustering algorithms",
          "Dimensionality reduction",
          "Anomaly detection",
        ],
      },
      {
        lessonNum: 4,
        title: "Deep Learning Introduction",
        duration: "4 hours",
        topics: [
          "Neural networks",
          "Convolutional neural networks",
          "TensorFlow and PyTorch",
        ],
      },
      {
        lessonNum: 5,
        title: "ML Pipeline & Deployment",
        duration: "2.5 hours",
        topics: [
          "Feature engineering",
          "Model evaluation and tuning",
          "Production deployment",
        ],
      },
    ],
    projects: [
      { name: "Predict Housing Prices", description: "Regression project" },
      { name: "Image Classification", description: "Deep learning project" },
      { name: "Customer Segmentation", description: "Unsupervised learning" },
    ],
  },
  {
    id: 8,
    title: "Cybersecurity Essentials",
    duration: "6 weeks",
    icon: Target,
    color: "from-indigo-500 to-indigo-600",
    lessons: [
      {
        lessonNum: 1,
        title: "Security Fundamentals",
        duration: "2.5 hours",
        topics: [
          "CIA triad and security concepts",
          "Common vulnerabilities",
          "Risk assessment",
        ],
      },
      {
        lessonNum: 2,
        title: "Network Security",
        duration: "3 hours",
        topics: [
          "Firewalls and VPNs",
          "Network protocols",
          "DDoS and mitigation",
        ],
      },
      {
        lessonNum: 3,
        title: "Application Security",
        duration: "3.5 hours",
        topics: [
          "OWASP Top 10",
          "Secure coding practices",
          "Authentication and encryption",
        ],
      },
      {
        lessonNum: 4,
        title: "Cryptography Basics",
        duration: "3 hours",
        topics: [
          "Symmetric vs asymmetric encryption",
          "Hashing and digital signatures",
          "SSL/TLS protocols",
        ],
      },
      {
        lessonNum: 5,
        title: "Incident Response & Ethics",
        duration: "2 hours",
        topics: [
          "Incident response procedures",
          "Ethical hacking",
          "Legal and compliance aspects",
        ],
      },
    ],
    projects: [
      { name: "Security Audit", description: "Analyze a web application for vulnerabilities" },
      { name: "Implement Encryption", description: "Build a secure communication system" },
    ],
  },
];

interface CurriculumProps {
  programTitle?: string;
}

const CurriculumSection: React.FC<CurriculumProps> = ({
  programTitle = "Weekend of Code",
}) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const toggleSection = (sectionId: number) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  // Calculate total hours
  const totalHours = CURRICULUM_DATA.reduce((acc, section) => {
    return (
      acc +
      section.lessons.reduce((lessonAcc, lesson) => {
        const hours = parseFloat(lesson.duration);
        return lessonAcc + hours;
      }, 0)
    );
  }, 0);

  return (
    <div className="w-full">
      <Card className="border border-border shadow-xl overflow-hidden bg-card rounded-[2rem]">
        {/* Header */}
        <div className="px-6 py-8 sm:py-10 border-b border-border text-foreground relative overflow-hidden bg-muted/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_8px_rgba(21,93,252,0.4)]" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">{programTitle}</h2>
            </div>
            <p className="text-muted-foreground mb-6 font-medium">Year-Long Comprehensive Learning Program</p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-full shadow-sm">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-bold">{totalHours.toFixed(0)} Hours</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-full shadow-sm">
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-bold">{CURRICULUM_DATA.length} Modules</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-full shadow-sm">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-bold">52 Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Sections */}
        <div className="divide-y divide-gray-200">
          {CURRICULUM_DATA.map((section) => (
            <div key={section.id} className="border-0">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="cursor-pointer w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-muted/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 text-left">
                  <div
                    className="bg-primary p-2.5 sm:p-3 rounded-xl text-white shadow-md"
                  >
                    <section.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm sm:text-base group-hover:text-primary transition-colors uppercase tracking-wide">
                      {section.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                      {section.duration} • {section.lessons.length} lessons
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-primary transition-transform ${
                    expandedSection === section.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Section Content */}
              {expandedSection === section.id && (
                <div className="bg-gray-50 px-6 py-4 space-y-3">
                  {/* Lessons */}
                  <div className="space-y-2">
                    {section.lessons.map((lesson, index) => {
                      const lessonId = `${section.id}-${index}`;
                      return (
                        <div
                          key={lessonId}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleLesson(lessonId)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 text-left">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                {lesson.lessonNum}
                              </span>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${
                                expandedLesson === lessonId ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Lesson Topics */}
                          {expandedLesson === lessonId && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                              <ul className="space-y-2">
                                {lesson.topics.map((topic, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-3 text-sm"
                                  >
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                                    <span className="text-gray-700">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Projects */}
                  {section.projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Real-Life Projects
                      </h4>
                      <div className="space-y-2">
                        {section.projects.map((project, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-yellow-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <p className="font-medium text-gray-900 text-sm">
                              {project.name}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {project.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-6 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-primary">
                {CURRICULUM_DATA.length}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">Modules</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-primary">
                {CURRICULUM_DATA.reduce((acc, s) => acc + s.lessons.length, 0)}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">Lessons</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-primary">
                {CURRICULUM_DATA.reduce(
                  (acc, s) =>
                    acc +
                    s.projects.length,
                  0
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider mt-1">Projects</p>
            </div>
          </div>
          <button className="w-full py-3.5 sm:py-4 bg-primary text-white font-black uppercase tracking-wider text-sm rounded-2xl hover:bg-secondary transition-all duration-300 shadow-lg shadow-blue-200/50 hover:scale-[1.01] active:scale-[0.99]">
            Get Started Now
          </button>
        </div>
      </Card>
    </div>
  );
};

export default CurriculumSection;
