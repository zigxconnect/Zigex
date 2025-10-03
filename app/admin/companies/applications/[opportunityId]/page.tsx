"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  // Add more fields as needed
}

const statusOptions = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationsPage({ params }: { params: { opportunityId: string } }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/companies/applications?opportunityId=${params.opportunityId}`)
      .then(res => res.json())
      .then(data => {
        setApplications(data.applications || []);
        setLoading(false);
      });
  }, [params.opportunityId]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    await fetch(`/api/companies/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    setApplications(applications =>
      applications.map(app =>
        app.id === appId ? { ...app, status: newStatus as Application["status"] } : app
      )
    );
    setUpdating(null);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Applications for Opportunity</h1>
      {applications.length === 0 ? (
        <div className="text-gray-500">No applications found.</div>
      ) : (
        <table className="w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Applicant</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Submitted</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-b last:border-b-0">
                <td className="p-3">{app.applicant_name}</td>
                <td className="p-3">{app.applicant_email}</td>
                <td className="p-3">{new Date(app.submitted_at).toLocaleString()}</td>
                <td className="p-3">
                  <select
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value)}
                    className="border rounded px-2 py-1"
                    disabled={updating === app.id}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <Button
                    // size="sm"
                    variant="primary"
                    disabled={updating === app.id}
                    onClick={() => handleStatusChange(app.id, app.status)}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
