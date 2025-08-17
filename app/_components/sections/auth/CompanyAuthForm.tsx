"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  MapPin,
  Globe,
  FileText,
  Loader2,
} from "lucide-react";

// --- UI Components (self-contained for portability) ---
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
  const baseClasses =
    "w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-500",
    orange:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
const Input = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => (
  <input
    className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${className}`}
    {...props}
  />
);
const TextArea = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => (
  <textarea
    className={`w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${className}`}
    rows={3}
    {...props}
  />
);

// --- Form Schema for Sign-Up ---
const signUpSchema = z.object({
  company_name: z.string().min(2, { message: "Company name is required." }),
  email: z.string().email({ message: "A valid email is required." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." }),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  website: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});
type SignUpFormData = z.infer<typeof signUpSchema>;

// --- Success Message Component ---
const SuccessMessage = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Registration Successful!
      </h3>
      <p className="text-gray-600 mb-6">
        Your company account has been created. You will now be redirected to
        sign in.
      </p>
      <Button variant="orange" onClick={onClose}>
        Continue to Sign In
      </Button>
    </div>
  </div>
);

// --- Main Component ---
export const CompanyAuthForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpFormData) => {
    console.log("Simulating company registration with data:", data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowSuccess(true);
    reset();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/sign-in"); // Redirect to the unified sign-in page
  };

  return (
    <>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Create Company Account
            </h1>
            <p className="text-gray-600 text-sm">
              Join our platform to find talented professionals
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Acme Corporation"
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
                  placeholder="123 Business Street, City, Country"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="pr-9"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button variant="orange" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-orange-500 hover:text-orange-600 hover:underline"
              >
                Sign In
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
      {showSuccess && <SuccessMessage onClose={handleSuccessClose} />}
    </>
  );
};
