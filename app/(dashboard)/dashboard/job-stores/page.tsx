"use client";

import { useState, useEffect } from "react";
import { MapPin, Briefcase, Users, Clock, Star, TrendingUp, Filter, Search, Building2, Hammer, Scissors, Wrench } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Local job opportunities in Cameroon
const jobOpportunities = [
  {
    id: "1",
    title: "Master Carpenter",
    company: "Bois & Craft Workshop",
    location: "Bamenda, Nord-Ouest",
    region: "Nord-Ouest",
    type: "Full-time",
    category: "Carpentry",
    salary: "85,000 - 150,000 XAF",
    logoColor: "#8B4513",
    icon: "🔨",
    postedDate: "2 days ago",
    applicants: 12,
    experience: "3-5 years"
  },
  {
    id: "2",
    title: "Hair Stylist",
    company: "Bella Beauty Salon",
    location: "Douala, Littoral",
    region: "Littoral",
    type: "Full-time",
    category: "Beauty",
    salary: "65,000 - 120,000 XAF",
    logoColor: "#E91E63",
    icon: "✂️",
    postedDate: "1 day ago",
    applicants: 8,
    experience: "2-4 years"
  },
  {
    id: "3",
    title: "Shoe Cobbler",
    company: "Quick Fix Shoe Repair",
    location: "Yaoundé, Centre",
    region: "Centre",
    type: "Part-time",
    category: "Repair Services",
    salary: "45,000 - 80,000 XAF",
    logoColor: "#654321",
    icon: "👞",
    postedDate: "3 days ago",
    applicants: 15,
    experience: "1-3 years"
  },
  {
    id: "4",
    title: "Tailor/Seamstress",
    company: "Fashion Point Atelier",
    location: "Bafoussam, Ouest",
    region: "Ouest",
    type: "Full-time",
    category: "Fashion",
    salary: "70,000 - 130,000 XAF",
    logoColor: "#9C27B0",
    icon: "🧵",
    postedDate: "1 day ago",
    applicants: 22,
    experience: "2-5 years"
  },
  {
    id: "5",
    title: "Motorcycle Mechanic",
    company: "Moto Service Center",
    location: "Maroua, Extrême-Nord",
    region: "Extrême-Nord",
    type: "Full-time",
    category: "Automotive",
    salary: "90,000 - 160,000 XAF",
    logoColor: "#FF5722",
    icon: "🔧",
    postedDate: "4 days ago",
    applicants: 18,
    experience: "3-6 years"
  },
  {
    id: "6",
    title: "Mobile Phone Technician",
    company: "Tech Repair Hub",
    location: "Douala, Littoral",
    region: "Littoral",
    type: "Full-time",
    category: "Electronics",
    salary: "75,000 - 140,000 XAF",
    logoColor: "#2196F3",
    icon: "📱",
    postedDate: "2 days ago",
    applicants: 25,
    experience: "2-4 years"
  },
  {
    id: "7",
    title: "Welder",
    company: "Metal Works Ltd",
    location: "Bertoua, Est",
    region: "Est",
    type: "Full-time",
    category: "Metalwork",
    salary: "95,000 - 180,000 XAF",
    logoColor: "#FF9800",
    icon: "🔥",
    postedDate: "5 days ago",
    applicants: 14,
    experience: "4-7 years"
  },
  {
    id: "8",
    title: "Street Food Vendor",
    company: "Local Market Association",
    location: "Garoua, Nord",
    region: "Nord",
    type: "Self-employed",
    category: "Food Service",
    salary: "50,000 - 100,000 XAF",
    logoColor: "#4CAF50",
    icon: "🍲",
    postedDate: "1 day ago",
    applicants: 31,
    experience: "1-2 years"
  },
  {
    id: "9",
    title: "House Painter",
    company: "Color Pro Painters",
    location: "Bamenda, Nord-Ouest",
    region: "Nord-Ouest",
    type: "Contract",
    category: "Construction",
    salary: "60,000 - 110,000 XAF",
    logoColor: "#795548",
    icon: "🎨",
    postedDate: "3 days ago",
    applicants: 19,
    experience: "2-4 years"
  },
  {
    id: "10",
    title: "Plumber",
    company: "Water Works Services",
    location: "Yaoundé, Centre",
    region: "Centre",
    type: "Full-time",
    category: "Plumbing",
    salary: "85,000 - 155,000 XAF",
    logoColor: "#607D8B",
    icon: "🚿",
    postedDate: "2 days ago",
    applicants: 16,
    experience: "3-5 years"
  },
  {
    id: "11",
    title: "Barber",
    company: "Gentlemen's Cut",
    location: "Limbe, Sud-Ouest",
    region: "Sud-Ouest",
    type: "Full-time",
    category: "Grooming",
    salary: "55,000 - 95,000 XAF",
    logoColor: "#34495E",
    icon: "💇‍♂️",
    postedDate: "4 days ago",
    applicants: 13,
    experience: "2-4 years"
  },
  {
    id: "12",
    title: "Electrician",
    company: "Power Solutions",
    location: "Ebolowa, Sud",
    region: "Sud",
    type: "Full-time",
    category: "Electrical",
    salary: "100,000 - 175,000 XAF",
    logoColor: "#F39C12",
    icon: "⚡",
    postedDate: "1 day ago",
    applicants: 21,
    experience: "3-6 years"
  }
];

// Featured job of the week
const featuredJob = {
  id: "featured",
  title: "Master Craftsperson",
  company: "Local Artisan Collective",
  location: "Bamenda, Nord-Ouest",
  type: "Full-time",
  category: "Handcraft",
  salary: "120,000 - 200,000 XAF",
  logoColor: "#8B4513",
  icon: "🏺",
  description: "Join our collective of skilled artisans creating beautiful traditional and modern crafts.",
  benefits: ["Flexible Hours", "Skill Training", "Material Support", "Market Access"],
  deadline: "March 15, 2025"
};

const regions = ["All Regions", "Centre", "Littoral", "Ouest", "Sud-Ouest", "Est", "Extrême-Nord", "Nord", "Nord-Ouest", "Adamaoua", "Sud"];

const JobCard = ({ job }: { job: any }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group hover:border-blue-300">
      {/* Card Header with Icon */}
      <div className="relative h-24 flex items-center justify-center" style={{ backgroundColor: `${job.logoColor}15` }}>
        <div className="text-4xl">{job.icon}</div>
        <div className="absolute top-3 right-3">
          <span className="text-xs px-2 py-1 bg-white/90 text-gray-600 rounded-full font-medium">
            {job.type}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Job Title & Company */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-700 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{job.company}</p>
        </div>

        {/* Job Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-blue-500" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase size={14} className="text-blue-500" />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
            <span className="text-green-600">💰</span>
            <span>{job.salary}/month</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-4">
          <span 
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-white rounded-full"
            style={{ backgroundColor: job.logoColor }}
          >
            {job.category}
          </span>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{job.postedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{job.applicants} applied</span>
          </div>
        </div>

        {/* Apply Button */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
          Apply Now
        </Button>
      </div>
    </div>
  );
};

const RightSidebar = () => {
  return (
    <div className="space-y-6">
      {/* Featured Job Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center gap-2">
            <Star className="text-yellow-300 fill-current" size={18} />
            <span className="font-semibold">Featured Opportunity</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{featuredJob.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {featuredJob.title}
              </h3>
              <p className="text-xs text-gray-600">{featuredJob.company}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={12} />
              <span>{featuredJob.location}</span>
            </div>
            <div className="text-xs font-semibold text-green-700">
              {featuredJob.salary}/month
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            {featuredJob.description}
          </p>

          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-xs">Benefits:</h4>
            <div className="grid grid-cols-2 gap-1">
              {featuredJob.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded text-center"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Apply by: {featuredJob.deadline}
          </div>

          <Button 
            className="w-full text-white font-medium py-2.5"
            style={{ backgroundColor: featuredJob.logoColor }}
          >
            Apply Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-600" />
          Local Job Market
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active Opportunities</span>
            <span className="font-bold text-blue-600 text-lg">1,247</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">New This Week</span>
            <span className="font-bold text-green-600">+89</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Most Popular</span>
            <span className="font-bold text-gray-800">Carpentry</span>
          </div>
        </div>
      </div>

      {/* Popular Skills */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wrench size={16} className="text-blue-600" />
          In-Demand Skills
        </h3>
        
        <div className="space-y-2">
          {[
            { skill: "Wood Working", demand: "High", color: "bg-green-500" },
            { skill: "Phone Repair", demand: "Very High", color: "bg-red-500" },
            { skill: "Hair Styling", demand: "High", color: "bg-yellow-500" },
            { skill: "Welding", demand: "Medium", color: "bg-blue-500" },
            { skill: "Tailoring", demand: "High", color: "bg-purple-500" }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-700">{item.skill}</span>
              </div>
              <span className="text-xs font-medium text-gray-600">{item.demand}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
        <h3 className="font-bold text-blue-800 mb-3 text-sm">💡 Success Tips</h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Highlight your hands-on experience</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Show examples of your work</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Get references from past clients</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Be available for flexible schedules</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default function JobStoresPage() {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState(jobOpportunities);

  useEffect(() => {
    let filtered = jobOpportunities;

    if (selectedRegion !== "All Regions") {
      filtered = filtered.filter(job => job.region === selectedRegion);
    }

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [selectedRegion, searchTerm]);

// tracking changes in the master branch

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-4xl font-bold">Local Job Opportunities</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover skilled trade and local service opportunities across Cameroon. 
              Connect with employers who value your hands-on skills and craftsmanship.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search jobs, skills, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-4 text-gray-400" size={18} />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center bg-blue-50 rounded-xl px-4">
              <div className="text-blue-800 font-medium">
                <span className="text-2xl font-bold text-blue-600">{filteredJobs.length}</span>
                <span className="ml-2">opportunities found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-300 mb-6">
                  <Briefcase size={80} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-4">No opportunities found</h3>
                <p className="text-gray-500">Try adjusting your search criteria or selected region.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}