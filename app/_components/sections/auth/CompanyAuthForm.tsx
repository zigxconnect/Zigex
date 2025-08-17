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
  Globe,
  FileText,
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

const TextArea = ({ className = "", ...props }: { className?: string; [key: string]: any }) => {
  return (
    <textarea
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${className}`}
      rows={3}
      {...props}
    />
  );
};

// Form Schemas
const signUpSchema = z.object({
  company_name: z.string().min(2, { message: "Company name must be at least 2 characters." }).max(100, { message: "Company name must be less than 100 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters." }).max(15, { message: "Phone number must be less than 15 characters." }).optional().or(z.literal("")),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }).max(200, { message: "Address must be less than 200 characters." }).optional().or(z.literal("")),
  website: z.string().url({ message: "Please enter a valid website URL." }).optional().or(z.literal("")),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;
type AuthFormProps = { type: "signIn" | "signUp" };

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
      linkText: "Don't have a company account?",
      linkHref: "/company/sign-up",
      linkActionText: "Create Account",
    },
    signUp: {
      title: "Create Company Account",
      subtitle: "Join our platform to find talented professionals",
      buttonText: "Create Account",
      linkText: "Already have an account?",
      linkHref: "/company/sign-in",
      linkActionText: "Sign In",
    },
  };

  const currentContent = content[type];

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentContent.title}
              </h1>
              <p className="text-gray-600 text-sm">{currentContent.subtitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp ? (
                <>
                  {/* Sign Up Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Acme Corporation"
                        className="pl-9 text-sm"
                        {...register("company_name")}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.company_name && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.company_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="contact@company.com"
                        className="pl-9 text-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Description *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <TextArea
                        placeholder="Describe your company, services, and what you're looking for..."
                        className="pl-9 text-sm"
                        {...register("description")}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="pl-9 text-sm"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="123 Business Street, City, State, Country"
                        className="pl-9 text-sm"
                        {...register("address")}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="url"
                        placeholder="https://www.company.com"
                        className="pl-9 text-sm"
                        {...register("website")}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.website && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                // Sign In Fields
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-9 text-sm"
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password {isSignUp && "*"}
                  </label>
                  {!isSignUp && (
                    <Link
                      href="/company/forgot-password"
                      className="text-xs text-orange-500 hover:text-orange-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                    className="pl-9 pr-9 text-sm"
                    {...register("password")}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                className="w-full py-2.5 text-sm font-semibold mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  currentContent.buttonText
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                {currentContent.linkText}{" "}
                <Link
                  href={currentContent.linkHref}
                  className="font-semibold text-orange-500 hover:text-orange-600 hover:underline"
                >
                  {currentContent.linkActionText}
                </Link>
              </p>
              <p className="text-xs text-gray-400 mt-3">
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