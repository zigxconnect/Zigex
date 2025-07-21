"use client"

import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { Search, MapPin, Briefcase, Sparkles, ChevronDown, X, Filter, Calendar, DollarSign, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchFilters {
  query: string;
  location: string;
  industry: string;
  skills: string[];
  paidOnly: boolean;
  duration: string;
  startDate: string;
  remote: boolean;
}

export const InternshipSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    industry: "",
    skills: [],
    paidOnly: false,
    duration: "",
    startDate: "",
    remote: false
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([
    "Software Engineering",
    "Marketing Intern",
    "Data Science"
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample data
  const locations = ["New York, NY", "San Francisco, CA", "Remote", "London, UK", "Seattle, WA", "Austin, TX"];
  const industries = ["Technology", "Finance", "Healthcare", "Marketing", "Design", "Engineering", "Consulting"];
  const skillsSuggestions = ["JavaScript", "Python", "React", "Data Analysis", "UI/UX", "Digital Marketing", "Project Management"];
  const durations = ["1-3 months", "3-6 months", "6+ months", "Summer (3 months)", "Part-time"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (filters.query.trim()) {
      const newHistory = [filters.query, ...searchHistory.filter(item => item !== filters.query)].slice(0, 5);
      setSearchHistory(newHistory);
    }
    console.log("Searching with filters:", filters);
    // Implement search logic here
  };

  const handleSkillSelect = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setActiveDropdown(null);
  };

  const removeSkill = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: "",
      location: "",
      industry: "",
      skills: [],
      paidOnly: false,
      duration: "",
      startDate: "",
      remote: false
    });
  };

  const hasActiveFilters = filters.location || filters.industry || filters.skills.length > 0 || 
    filters.paidOnly || filters.duration || filters.startDate || filters.remote;

  const Dropdown = ({ items, onSelect, type }: { items: string[], onSelect: (item: string) => void, type: string }) => (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Main Search Row */}
      <div className="flex flex-col lg:flex-row gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Search Input with History */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search internships, companies, or skills..."
            className="pl-10 pr-4 py-3 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            onFocus={() => setActiveDropdown(filters.query ? null : 'history')}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {/* Search History Dropdown */}
          {activeDropdown === 'history' && searchHistory.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">Recent Searches</div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  onClick={() => setFilters(prev => ({ ...prev, query: item }))}
                >
                  <Clock size={14} className="text-gray-400" />
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Location Filter */}
          <div className="relative">
            <Button
              variant="secondary"
              className={`justify-start gap-2 ${filters.location ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
            >
              <MapPin size={16} />
              {filters.location || 'Location'}
              <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
            </Button>
            {activeDropdown === 'location' && (
              <Dropdown
                items={locations}
                onSelect={(location) => {
                  setFilters(prev => ({ ...prev, location }));
                  setActiveDropdown(null);
                }}
                type="location"
              />
            )}
          </div>

          {/* Industry Filter */}
          <div className="relative">
            <Button
              variant="secondary"
              className={`justify-start gap-2 ${filters.industry ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'industry' ? null : 'industry')}
            >
              <Briefcase size={16} />
              {filters.industry || 'Industry'}
              <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'industry' ? 'rotate-180' : ''}`} />
            </Button>
            {activeDropdown === 'industry' && (
              <Dropdown
                items={industries}
                onSelect={(industry) => {
                  setFilters(prev => ({ ...prev, industry }));
                  setActiveDropdown(null);
                }}
                type="industry"
              />
            )}
          </div>

          {/* Skills Filter */}
          <div className="relative">
            <Button
              variant="secondary"
              className={`justify-start gap-2 ${filters.skills.length ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              onClick={() => setActiveDropdown(activeDropdown === 'skills' ? null : 'skills')}
            >
              <Sparkles size={16} />
              Skills {filters.skills.length > 0 && `(${filters.skills.length})`}
              <ChevronDown size={14} className={`transition-transform ${activeDropdown === 'skills' ? 'rotate-180' : ''}`} />
            </Button>
            {activeDropdown === 'skills' && (
              <Dropdown
                items={skillsSuggestions}
                onSelect={handleSkillSelect}
                type="skills"
              />
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="secondary"
            className={`gap-2 ${showAdvanced ? 'bg-gray-100' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={16} />
            More
            <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>

          {/* Search Button */}
          <Button 
            variant="primary" 
            className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleSearch}
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Selected Skills Tags */}
      {filters.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6">
          {filters.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-700">
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration Filter */}
            <div className="relative">
              <Button
                variant="secondary"
                className={`w-full justify-between ${filters.duration ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                onClick={() => setActiveDropdown(activeDropdown === 'duration' ? null : 'duration')}
              >
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {filters.duration || 'Duration'}
                </span>
                <ChevronDown size={14} />
              </Button>
              {activeDropdown === 'duration' && (
                <Dropdown
                  items={durations}
                  onSelect={(duration) => {
                    setFilters(prev => ({ ...prev, duration }));
                    setActiveDropdown(null);
                  }}
                  type="duration"
                />
              )}
            </div>

            {/* Start Date */}
            <div>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
                placeholder="Start Date"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.paidOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, paidOnly: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <DollarSign size={14} />
                  Paid Only
                </span>
              </label>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => setFilters(prev => ({ ...prev, remote: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Remote OK
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-gray-600 px-6">
          <span>Active filters:</span>
          {filters.location && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{filters.location}</span>}
          {filters.industry && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{filters.industry}</span>}
          {filters.duration && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{filters.duration}</span>}
          {filters.paidOnly && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Paid Only</span>}
          {filters.remote && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Remote OK</span>}
        </div>
      )}
    </div>
  );
};