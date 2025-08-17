'use client';

import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  university: string;
  avatar: string;
  bgColor: string;
  skills: string[];
  moreCount?: number;
}

const students: Student[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    university: 'University of Vancouver',
    avatar: 'SM',
    bgColor: 'bg-blue-600',
    skills: ['React', 'Node.js', 'MongoDB'],
    moreCount: 1
  },
  {
    id: '2',
    name: 'Emmanuel Tabi',
    university: 'University of Buea',
    avatar: 'ET',
    bgColor: 'bg-orange-600',
    skills: ['Python', 'Django', 'PostgreSQL'],
    moreCount: 1
  },
  {
    id: '3',
    name: 'Grace Nkomo',
    university: 'University of Bamenda',
    avatar: 'GN',
    bgColor: 'bg-emerald-500',
    skills: ['UI/UX Design', 'Figma', 'Adobe XD'],
    moreCount: 1
  },
  {
    id: '4',
    name: 'David Foncha',
    university: 'University of Dschang',
    avatar: 'DF',
    bgColor: 'bg-purple-600',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    moreCount: 1
  },
  {
    id: '5',
    name: 'Mercy Ashu',
    university: 'University of Douala',
    avatar: 'MA',
    bgColor: 'bg-orange-500',
    skills: ['Data Science', 'Python', 'Pandas'],
    moreCount: 1
  },
  {
    id: '6',
    name: 'Kevin Mbah',
    university: 'University of Maroua',
    avatar: 'KM',
    bgColor: 'bg-red-500',
    skills: ['Flutter', 'Dart', 'Firebase'],
    moreCount: 1
  }
];

const MeetOtherInterns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Name (A-Z)');
  const [universityFilter, setUniversityFilter] = useState('All Universities');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Meet Other Interns</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Filter Dropdowns */}
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option>All Universities</option>
                  <option>University of Vancouver</option>
                  <option>University of Buea</option>
                  <option>University of Bamenda</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              
              <div className="relative">
                <span className="text-sm text-gray-600 mr-2">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer"
                >
                  <option>Name (A-Z)</option>
                  <option>Name (Z-A)</option>
                  <option>University</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <p className="text-gray-600 text-sm mb-6">
            <span className="font-semibold">{filteredStudents.length}</span> students found
          </p>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 ${student.bgColor} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                  {student.avatar}
                </div>
              </div>
              
              {/* Student Info */}
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{student.name}</h3>
                <p className="text-gray-600 text-sm">{student.university}</p>
              </div>
              
              {/* Skills Section */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Top Skills</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {student.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {student.moreCount && (
                  <p className="text-xs text-gray-500">+{student.moreCount} more</p>
                )}
              </div>
              
              {/* View Profile Button */}
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 outline-none">
                View Profile
              </button>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetOtherInterns;