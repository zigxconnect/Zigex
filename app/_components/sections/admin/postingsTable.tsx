import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface InternshipData {
  title: string;
  datePosted: string;
  status: 'Active' | 'Draft' | 'Closed';
  applications: number;
}

const InternshipTable: React.FC = () => {
  const internshipData: InternshipData[] = [
    {
      title: "Software Development Intern",
      datePosted: "Jan 15, 2024",
      status: "Active",
      applications: 24
    },
    {
      title: "Marketing Assistant",
      datePosted: "Jan 11, 2024",
      status: "Active",
      applications: 18
    },
    {
      title: "Finance Intern",
      datePosted: "Jan 9, 2024",
      status: "Draft",
      applications: 31
    },
    {
      title: "Data Analyst Trainee",
      datePosted: "Jan 7, 2024",
      status: "Active",
      applications: 15
    },
    {
      title: "HR Assistant",
      datePosted: "Jan 5, 2024",
      status: "Draft",
      applications: 0
    },
    {
      title: "Graphic Design Intern",
      datePosted: "Jan 2, 2024",
      status: "Closed",
      applications: 22
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="px-3 py-1 text-xs font-medium text-white bg-[#10B981] rounded-full">
          Active
        </span>
      );
    } else if (status === 'Draft') {
      return (
        <span className="px-3 py-1 text-xs font-medium text-white bg-[#F59E0B] rounded-full">
          Draft
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 text-xs font-medium text-white bg-[#64748B] rounded-full">
          Closed
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-[#1E3A8A]">
                Internship Title
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-[#1E3A8A]">
                Date Posted
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-[#1E3A8A]">
                Status
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-[#1E3A8A]">
                Applications
              </th>
              <th className="text-left py-3 px-6 text-sm font-medium text-[#1E3A8A]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {internshipData.map((internship, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-6 text-sm text-[#1E3A8A] font-medium">
                  {internship.title}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {internship.datePosted}
                </td>
                <td className="py-4 px-6">
                  {getStatusBadge(internship.status)}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                  {internship.applications}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <button className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternshipTable;