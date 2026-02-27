// lib/data/curriculum.ts

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    type: 'video' | 'reading' | 'assignment' | 'project';
    completed?: boolean;
    url?: string;
}

export interface CurriculumModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    lessons: Lesson[];
}

export interface LevelCurriculum {
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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
                        id: "ai-p1",
                        title: "Phase 1: AI Landscape & Python Essentials",
                        description: "First Principles: What is intelligence? History of AI from Turing to Transformers. Setting up a professional local environment (VS Code, Conda, Poetry). Python mastery: Decorators, Generators, Type Hinting, and OOP.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "ai-p1-l1", title: "The AI Map: GOFAI to GenAI", duration: "20 min", type: "video", url: "https://www.youtube.com/watch?v=J393526Jv6I" },
                            { id: "ai-p1-l2", title: "Python Masterclass: Advanced Syntax", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=rfscVS0vtbw" },
                            { id: "ai-p1-l3", title: "Environment Orchestration (Conda/UV)", duration: "15 min", type: "reading", url: "https://docs.conda.io/projects/conda/en/latest/user-guide/getting-started.html" },
                            { id: "ai-p1-l4", title: "Project: Building a Rule-Based Chatbot", duration: "2 hours", type: "project", url: "https://github.com/microsoft/generative-ai-for-beginners" }
                        ]
                    },
                    {
                        id: "ai-p2",
                        title: "Phase 2: Data Science Ecosystem (The Fuel)",
                        description: "Mastering the NumPy/Pandas/Matplotlib trinity. Exploratory Data Analysis (EDA). Real-life example: How Netflix uses collaborative filtering data foundations.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "ai-p2-l1", title: "Vectorized Operations with NumPy", duration: "30 min", type: "video", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI" },
                            { id: "ai-p2-l2", title: "Data Wrangling with Pandas", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=vmEHCJofslg" },
                            { id: "ai-p2-l3", title: "Visual Storytelling (Seaborn/Plotly)", duration: "25 min", type: "reading", url: "https://seaborn.pydata.org/tutorial.html" },
                            { id: "ai-p2-l4", title: "Project: Analyzing NYC Taxi Datasets", duration: "3 hours", type: "project", url: "https://www.kaggle.com/c/nyc-taxi-trip-duration" }
                        ]
                    },
                    {
                        id: "ai-p3",
                        title: "Phase 3: Machine Learning Foundations",
                        description: "Supervised (Bias-Variance Tradeoff), Unsupervised (Clustering/PCA), and Reinforcement Learning (Intro). Linear Regression from scratch. Case Study: Tesla's early perception systems.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-p3-l1", title: "Stanford CS229: Supervised Learning", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=jGwO_UgTS7I&list=PLoROMvodv4rMiGQp3WXS7dW09s8736Hq0" },
                            { id: "ai-p3-l2", title: "Clustering & Dimensionality Reduction", duration: "35 min", type: "video", url: "https://www.youtube.com/watch?v=fS6_shmK3S0" },
                            { id: "ai-p3-l3", title: "Intro to RL: Markov Decision Processes", duration: "30 min", type: "reading", url: "https://web.stanford.edu/class/psych209/Readings/SuttonBartoIPRL.pdf" },
                            { id: "ai-p3-l4", title: "Project: Predicting Real Estate Prices", duration: "4 hours", type: "project", url: "https://www.kaggle.com/datasets/shibumohapatra/house-price-prediction-dataset" }
                        ]
                    }
                ]
            },
            {
                level: "Intermediate",
                modules: [
                    {
                        id: "ai-p4",
                        title: "Phase 4: Mathematical Foundations (The Deep Why)",
                        description: "Linear Algebra (Tensors, Eigenvalues), Multivariable Calculus (Partial Derivatives), Probability & Statistics (Bayesian Inference). First Principles: Why do gradients flow?",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-p4-l1", title: "Linear Algebra for AI (3Blue1Brown)", duration: "60 min", type: "video", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" },
                            { id: "ai-p4-l2", title: "Calculus: Backpropagation Math", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=Ilg3gGewQ5U" },
                            { id: "ai-p4-l3", title: "Probability: Distributions & Likelihood", duration: "30 min", type: "reading", url: "https://seeing-theory.brown.edu/" },
                            { id: "ai-p4-l4", title: "Assignment: Manual Backprop in Python", duration: "2 hours", type: "assignment", url: "https://github.com/karpathy/micrograd" }
                        ]
                    },
                    {
                        id: "ai-p5",
                        title: "Phase 5: Deep Learning & Neural Networks",
                        description: "PyTorch vs TensorFlow. Building MLP, CNN (Computer Vision), and RNN (Sequences). Optimization: SGD, Adam, Softmax. Company Focus: OpenAI's early research (GPT-1/2).",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-p5-l1", title: "PyTorch Deep Dive (Fast.ai)", duration: "55 min", type: "video", url: "https://www.youtube.com/watch?v=8mG_N-K_v_4" },
                            { id: "ai-p5-l2", title: "Stanford CS231n: CNN Architecture", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=vT1JzLTH4G4&list=PL3FW7Lu3i5JvHm8c_70HiT2_V9y3u7E5M" },
                            { id: "ai-p5-l3", title: "Regularization: Dropout & Batch Norm", duration: "20 min", type: "reading", url: "https://pytorch.org/docs/stable/nn.html#normalization-layers" },
                            { id: "ai-p5-l4", title: "Project: MNIST Digit Classifier", duration: "5 hours", type: "project", url: "https://github.com/pytorch/examples/tree/main/mnist" }
                        ]
                    },
                    {
                        id: "ai-p6",
                        title: "Phase 6: Modern NLP & Transformers",
                        description: "Word Embeddings (Word2Vec). Attention is All You Need. Tokenization techniques. BERT, T5, and the encoder-decoder paradigm.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-p6-l1", title: "The Self-Attention Mechanism (Andre Karpathy)", duration: "65 min", type: "video", url: "https://www.youtube.com/watch?v=kCc8FmEb1nY" },
                            { id: "ai-p6-l2", title: "Stanford CS224N: Transformers", duration: "90 min", type: "video", url: "https://www.youtube.com/watch?v=enpIOZz8Ssg&list=PLoROMvodv4rMFqRtEuo6SGjY4XbeMZSYx" },
                            { id: "ai-p6-l3", title: "HuggingFace Course: Transformers Intro", duration: "30 min", type: "reading", url: "https://huggingface.co/learn/nlp-course/chapter1/1" },
                            { id: "ai-p6-l4", title: "Project: Sentiment Analysis Engine", duration: "4 hours", type: "project", url: "https://huggingface.co/docs/transformers/tasks/sequence_classification" }
                        ]
                    }
                ]
            },
            {
                level: "Advanced",
                modules: [
                    {
                        id: "ai-p7",
                        title: "Phase 7: Generative AI & Fine-tuning LLMs",
                        description: "Prompt Engineering vs Fine-tuning. PEFT (Parameter-Efficient Fine-Tuning): LoRA, QLoRA. RLHF (Reinforcement Learning from Human Feedback). Managing hallucinations.",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-p7-l1", title: "LoRA & QLoRA Deep Dive", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=dA-NhCtrre0" },
                            { id: "ai-p7-l2", title: "Dataset Prep for Instruction Tuning", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=Y68f1mD8P3U" },
                            { id: "ai-p7-l3", title: "RLHF: Reward Models & PPO", duration: "60 min", type: "video", url: "https://www.youtube.com/watch?v=2MBJOuVq380" },
                            { id: "ai-p7-l4", title: "Project: Fine-tuning Llama-3", duration: "8 hours", type: "project", url: "https://huggingface.co/docs/auto-train/index" }
                        ]
                    },
                    {
                        id: "ai-p8",
                        title: "Phase 8: Advanced Vision & Multimodality",
                        description: "Diffusion Models (Stable Diffusion) explained. GANs vs VAEs. Vision Transformers (ViT). CLIP and multimodal embeddings.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-p8-l1", title: "Stable Diffusion: Forward & Reverse Process", duration: "55 min", type: "video", url: "https://www.youtube.com/watch?v=fbLgFrlAzpE" },
                            { id: "ai-p8-l2", title: "Vision Transformers (ViT) Mastery", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=ovB0S-as9MA" },
                            { id: "ai-p8-l3", title: "ControlNet & Image-to-Image", duration: "30 min", type: "reading", url: "https://github.com/lllyasviel/ControlNet" },
                            { id: "ai-p8-l4", title: "Project: Custom Image Generator", duration: "6 hours", type: "project", url: "https://github.com/huggingface/diffusers" }
                        ]
                    },
                    {
                        id: "ai-p9",
                        title: "Phase 9: RAG Systems & Vector Databases",
                        description: "Semantic Search. Vector databases: Pinecone, Milvus, ChromaDB. Query translation, routing, and re-ranking. First Principles: The trade-offs of embedding model selection.",
                        duration: "3 Weeks",
                        lessons: [
                            { id: "ai-p9-l1", title: "Embedding Models & Vector Spaces", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=68T97iPtoVs" },
                            { id: "ai-p9-l2", title: "Advanced RAG: Hybrid Search", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=u6B3qfR9RKA" },
                            { id: "ai-p9-l3", title: "Vector DB Scaling (Pinecone Docs)", duration: "35 min", type: "reading", url: "https://docs.pinecone.io/docs/overview" },
                            { id: "ai-p9-l4", title: "Project: Production-Grade RAG", duration: "7 hours", type: "project", url: "https://python.langchain.com/docs/use_cases/question_answering/" }
                        ]
                    },
                    {
                        id: "ai-p10",
                        title: "Phase 10: AI Agents & Multi-Agent Systems",
                        description: "Autonomous Agents. Tool-calling & Function-calling. LangChain, CrewAI, and Microsoft AutoGen. Model Context Protocol (MCP) for tool discovery.",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-p10-l1", title: "Agentic Workflows (Andrew Ng)", duration: "60 min", type: "video", url: "https://www.youtube.com/watch?v=sal78ACtGTc" },
                            { id: "ai-p10-l2", title: "Building Tools for AI (Function Calling)", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=aqD8-6A1M0M" },
                            { id: "ai-p10-l3", title: "Multi-Agent Coordination (CrewAI)", duration: "40 min", type: "reading", url: "https://docs.crewai.com/how-to/Creating-an-Agent/" },
                            { id: "ai-p10-l4", title: "Project: Autonomous Researcher Agent", duration: "10 hours", type: "project", url: "https://github.com/joaomdmoura/crewAI-examples" }
                        ]
                    }
                ]
            },
            {
                level: "Expert",
                modules: [
                    {
                        id: "ai-p11",
                        title: "Phase 11: MLOps & Production Serving",
                        description: "Model Deployment. CI/CD for ML. Quantization (GGUF, EXL2). Model Serving with vLLM, Ollama, or TGI. Monitoring and Observability (Arize, Weights & Biases).",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-p11-l1", title: "Docker & Kubernetes for AI", duration: "70 min", type: "video", url: "https://www.youtube.com/watch?v=pTFZFxd4hOI" },
                            { id: "ai-p11-l2", title: "Quantization: Speed vs Accuracy", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=TP-UfAtreWw" },
                            { id: "ai-p11-l3", title: "Observability for LLMs (W&B)", duration: "30 min", type: "reading", url: "https://docs.wandb.ai/guides/prompts" },
                            { id: "ai-p11-l4", title: "Project: E2E MLOps Pipeline", duration: "12 hours", type: "project", url: "https://github.com/mlops-basics/mlops-basics" }
                        ]
                    },
                    {
                        id: "ai-p12",
                        title: "Phase 12: Research Frontiers & AI Strategy",
                        description: "Scaling Laws. Video Generation (Sora-like architectures). Reasoning Models (Tree-of-Thought). Robotics & Embodied AI. AI Safety & Ethics. Startup Thinking: How to build an AI product (not just a wrapper).",
                        duration: "4 Weeks",
                        lessons: [
                            { id: "ai-p12-l1", title: "State of the Art: Research Review", duration: "80 min", type: "video", url: "https://www.youtube.com/watch?v=9vM4p9fyt64" },
                            { id: "ai-p12-l2", title: "Ethics, Bias & Alignment", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=hIDik-Y190o" },
                            { id: "ai-p12-l3", title: "AI Strategy: Building Value (Hardward BS)", duration: "45 min", type: "reading", url: "https://hbr.org/2023/12/how-to-implement-ai" },
                            { id: "ai-p12-l4", title: "Capstone: The Million-Dollar AI Idea MVP", duration: "20 hours", type: "project", url: "https://github.com/ycombinator/llm-list" }
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
                            { id: "web-beg-m1-l1", title: "Semantic HTML5 Masterclass", duration: "20 min", type: "video", url: "https://www.youtube.com/watch?v=kUMe1FH4CHE" },
                            { id: "web-beg-m1-l2", title: "CSS Flexbox & Grid Masterclass", duration: "50 min", type: "video", url: "https://www.youtube.com/watch?v=3YW65K6i0u8" },
                            { id: "web-beg-m1-l3", title: "Responsive Web Design (web.dev)", duration: "30 min", type: "reading", url: "https://web.dev/learn/design/" },
                            { id: "web-beg-m1-l4", title: "Project: Personal Portfolio Website", duration: "3 hours", type: "project", url: "https://github.com/topics/portfolio-template" }
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
                            { id: "web-int-m1-l1", title: "React Fundamentals for 2026", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=SqcY0GlETPk" },
                            { id: "web-int-m1-l2", title: "Hooks: useState & useEffect", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=0ZJgIjIuY7U" },
                            { id: "web-int-m1-l3", title: "Mastering Next.js App Router", duration: "60 min", type: "video", url: "https://www.youtube.com/watch?v=wm5gMKuwSYk" },
                            { id: "web-int-m1-l4", title: "Project: E-commerce Dashboard", duration: "4 hours", type: "project", url: "https://github.com/vercel/nextjs-subscription-payments" }
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
                            { id: "ds-beg-m1-l1", title: "Mathematical Statistics (MIT)", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=V0RLjueOKXQ&list=PLUl4u3cNGP60uVBMaoREE27lcC1N0_4uR" },
                            { id: "ds-beg-m1-l2", title: "Probability Theory", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=vGcmjInMh1w" },
                            { id: "ds-beg-m1-l3", title: "Inferential Statistics Handbook", duration: "40 min", type: "reading", url: "https://onlinestatbook.com/2/index.html" },
                            { id: "ds-beg-m1-l4", title: "Project: A/B Test Simulation", duration: "2 hours", type: "project", url: "https://github.com/topics/ab-testing" }
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
                        title: "Cross-Platform Frameworks (Flutter/RN)",
                        description: "Introduction to React Native and Flutter architecture.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "mob-beg-m1-l1", title: "React Native in 100 Seconds", duration: "2 min", type: "video", url: "https://www.youtube.com/watch?v=gvkq-nNVU64" },
                            { id: "mob-beg-m1-l2", title: "Flutter Crash Course 2026", duration: "90 min", type: "video", url: "https://www.youtube.com/watch?v=VPvVD8t02U8" },
                            { id: "mob-beg-m1-l3", title: "Native Bridge and Modules", duration: "35 min", type: "reading", url: "https://reactnative.dev/docs/native-modules-intro" },
                            { id: "mob-beg-m1-l4", title: "Project: Cross-Platform Music App", duration: "5 hours", type: "project", url: "https://github.com/topics/react-native-template" }
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
                        title: "Security Essentials & Hacking Intro",
                        description: "Understanding threats, vulnerabilities, and defense mechanisms.",
                        duration: "2 Weeks",
                        lessons: [
                            { id: "cyber-beg-m1-l1", title: "Certified Ethical Hacker Intro", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE" },
                            { id: "cyber-beg-m1-l2", title: "Cryptography Basics", duration: "45 min", type: "video", url: "https://www.youtube.com/watch?v=V2-QCzsh6zI" },
                            { id: "cyber-beg-m1-l3", title: "Network Security Protocols", duration: "40 min", type: "video", url: "https://www.youtube.com/watch?v=D_9W88K_x-s" },
                            { id: "cyber-beg-m1-l4", title: "Project: Vulnerability Scanner", duration: "4 hours", type: "project", url: "https://github.com/topics/vulnerability-scanner" }
                        ]
                    }
                ]
            }
        ]
    }
];

export function getProgramCurriculum(programName: string): ProgramCurriculum | null {
    if (!programName) return null;

    const normalize = (s: string) => s.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const searchStr = normalize(programName);

    let match = PROGRAM_CURRICULA.find(pc => normalize(pc.program) === searchStr);
    if (match) return match;

    match = PROGRAM_CURRICULA.find(pc => {
        const pcNorm = normalize(pc.program);
        return searchStr.includes(pcNorm) || pcNorm.includes(searchStr);
    });

    if (match) return match;

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
