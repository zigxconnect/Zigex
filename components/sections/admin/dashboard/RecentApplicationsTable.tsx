"use client";

import { Eye, Inbox } from "lucide-react";

// A reusable component to display when the table has no data.
const EmptyTableState = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => (
  <div className="text-center py-16">
    <Inbox className="mx-auto h-12 w-12 text-gray-300" />
    <h3 className="mt-2 text-lg font-semibold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
  </div>
);

// Define the shape of the prop for type safety.
type ApplicationsData = {
  hasData: boolean;
  data?: any[];
  emptyState?: { title: string; message: string };
};

export const RecentApplicationsTable = ({
  applicationsData,
}: {
  applicationsData: ApplicationsData;
}) => {
  // *** THIS FUNCTION WAS MISSING - NOW INCLUDED ***
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Applications
          </h3>
          <button className="flex items-center space-x-2 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>
      </div>

      {!applicationsData.hasData ? (
        <EmptyTableState
          title={applicationsData.emptyState!.title}
          message={applicationsData.emptyState!.message}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* *** TABLE HEADER WAS MISSING - NOW INCLUDED *** */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            {/* *** TABLE BODY WAS MISSING - NOW INCLUDED *** */}
            <tbody className="bg-white divide-y divide-gray-200">
              {applicationsData.data!.map((app: any) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {app.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {app.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {app.field}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 transition-colors">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
