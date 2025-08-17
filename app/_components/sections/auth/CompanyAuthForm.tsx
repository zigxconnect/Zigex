// File: app/_components/sections/auth/CompanyAuthForm.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Building2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone,
  MapPin,
  Briefcase,
  Loader2
} from "lucide-react";

// UI Components
const Button = ({ 
  children, 
  variant = "default", 
  className = "", 
  disabled = false, 
  ...props 
}: {
  children: React.ReactNode;
  variant?: "default" | "orange" | "outline";
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500",
    orange: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }: { className?: string; [key: string]: any }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
      {...props}
    />
  );
};

const SocialButton = ({ 
  icon: Icon, 
  text, 
  className = "",
  onClick
}: { 
  icon: React.ComponentType<any>; 
  text: string; 
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium ${className}`}
    >
      <Icon className="w-5 h-5" />
      {text}
    </button>
  );
};

// Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Form Schemas
const signUpSchema = z.object({
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  contactName: z.string().min(2, { message: "Contact name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  industry: z.string().min(1, { message: "Please select an industry." }),
  location: z.string().min(2, { message: "Please enter your location." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;
type AuthFormProps = { type: "signIn" | "signUp" };

// Divider Component
const Divider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white px-3 text-gray-500 font-medium">OR</span>
    </div>
  </div>
);

// Success Message Component
const SuccessMessage = ({ type, onClose }: { type: "signIn" | "signUp"; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {type === "signUp" ? "Registration Successful!" : "Sign In Successful!"}
      </h3>
      <p className="text-gray-600 mb-6">
        {type === "signUp" 
          ? "Your company account has been created successfully. You can now start using our platform!"
          : "Welcome back! You have successfully signed in to your company account."
        }
      </p>
      <Button variant="orange" onClick={onClose} className="w-full">
        Continue
      </Button>
    </div>
  </div>
);

// Main Component
export const CompanyAuthForm = ({ type }: AuthFormProps) => {
  const isSignUp = type === "signUp";
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData | SignInFormData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  });

  const content = {
    signIn: {
      title: "Welcome Back",
      subtitle: "Sign in to your company account",
      buttonText: "Sign In",
      socialButtonText: "Sign in",
      linkText: "Don't have a company account?",
      linkHref: "/company/sign-up",
      linkActionText: "Create Account",
    },
    signUp: {
      title: "Create Company Account",
      subtitle: "Join our platform to find talented professionals",
      buttonText: "Create Account",
      socialButtonText: "Sign up",
      linkText: "Already have an account?",
      linkHref: "/company/sign-in",
      linkActionText: "Sign In",
    },
  };

  const currentContent = content[type];

  const industries = [
    "Technology",
    "Healthcare", 
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Consulting",
    "Marketing & Advertising",
    "Real Estate",
    "Other"
  ];

  // Simulate form submission
  const onSubmit = async (data: SignUpFormData | SignInFormData) => {
    console.log(`${type === "signUp" ? "Registration" : "Sign In"} Data:`, data);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    setShowSuccess(true);
    
    // Reset form
    reset();
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`${provider} authentication clicked`);
    // Here you would integrate with actual social auth providers
    alert(`${provider} authentication would be integrated here!`);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-900 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentContent.title}
              </h1>
              <p className="text-gray-600">{currentContent.subtitle}</p>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 mb-6">
              <SocialButton
                icon={GoogleIcon}
                text={`${currentContent.socialButtonText} with Google`}
                onClick={() => handleSocialAuth("Google")}
                className="hover:border-gray-400"
              />
              <SocialButton
                icon={Mail}
                text={`${currentContent.socialButtonText} with Microsoft`}
                onClick={() => handleSocialAuth("Microsoft")}
                className="bg-[#0078d4] text-white hover:bg-[#106ebe] border-[#0078d4]"
              />
            </div>

            <Divider />

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {isSignUp ? (
                <>
                  {/* Sign Up Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="Acme Corporation"
                          className="pl-10"
                          {...register("companyName")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="John Smith"
                          className="pl-10"
                          {...register("contactName")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.contactName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.contactName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          className="pl-10"
                          {...register("email")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          {...register("phone")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          {...register("industry")}
                          disabled={isSubmitting}
                        >
                          <option value="">Select Industry</option>
                          {industries.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.industry && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.industry.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="text"
                          placeholder="New York, NY"
                          className="pl-10"
                          {...register("location")}
                          disabled={isSubmitting}
                        />
                      </div>
                      {errors.location && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.location.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                // Sign In Fields
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10"
                      {...register("email")}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password {isSignUp && "*"}
                  </label>
                  {!isSignUp && (
                    <Link
                      href="/company/forgot-password"
                      className="text-sm text-orange-500 hover:text-orange-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    className="pl-10 pr-10"
                    {...register("password")}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                variant="orange"
                type="submit"
                className="w-full py-3 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  currentContent.buttonText
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-8">
              <p className="text-gray-600">
                {currentContent.linkText}{" "}
                <Link
                  href={currentContent.linkHref}
                  className="font-semibold text-orange-500 hover:text-orange-600 hover:underline"
                >
                  {currentContent.linkActionText}
                </Link>
              </p>
              <p className="text-xs text-gray-400 mt-4">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-gray-600">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessMessage 
          type={type} 
          onClose={() => setShowSuccess(false)} 
        />
      )}
    </>
  );
};