// app/test-company-profile/page.tsx
// import { getAllCompanies } from '@/lib/actions/company';

import { getAllCompanies } from "@/lib/actions/programs/companies.action";

interface Company {
  id?: string;
  user_id?: string;
  company_name: string;
  email: string;
  description: string;
  industry?: string;
  phone?: string;
  address?: string;
  website_url?: string;
  logo_url?: string;
  cover_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export default async function TestCompanyProfilePage() {
  // Use server action instead of API route
  const result = await getAllCompanies();

  // Comprehensive logging for debugging

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Company Profiles Test</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Server Action Response: {result.success ? `${result.count} Companies Found` : 'Error'}
        </h2>

        {!result.success ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{result.error}</p>

            <div className="mt-4 text-sm text-red-500">
              <p><strong>Troubleshooting steps:</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Check if the database table <code className="bg-red-100 px-1 rounded">company_profiles</code> exists</li>
                <li>Verify Supabase connection and credentials</li>
                <li>Check the server action file path: <code className="bg-red-100 px-1 rounded">lib/actions/company.ts</code></li>
                <li>Look at the server console for detailed error logs</li>
              </ol>
            </div>
          </div>
        ) : result.data && result.data.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">No Companies Found</h3>
            <p className="text-yellow-600">The database contains no company profiles yet.</p>

            <div className="mt-4 text-sm text-yellow-600">
              <p><strong>This could mean:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No companies have signed up yet</li>
                <li>The table name might be different</li>
                <li>Companies exist but in a different table</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-green-800 mb-4">
              Success - Found {result.count} Companies
            </h3>

            {/* Companies Grid */}
            <div className="space-y-6">
              {result.data?.map((company, index) => (
                <div key={company.id || index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-semibold text-gray-800">
                      {company.company_name}
                    </h4>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Company #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Company ID</label>
                      <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                        {company.id || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">User ID</label>
                      <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                        {company.user_id || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{company.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Industry</label>
                      <p className="text-gray-900">{company.industry || 'Not specified'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{company.phone || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600">Website</label>
                      <p className="text-gray-900">
                        {company.website_url ? (
                          <a href={company.website_url} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all">
                            {company.website_url.length > 30
                              ? company.website_url.substring(0, 30) + '...'
                              : company.website_url
                            }
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    </div>
                  </div>

                  {company.description && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">
                        {company.description.length > 200
                          ? company.description.substring(0, 200) + '...'
                          : company.description
                        }
                      </p>
                    </div>
                  )}

                  {company.address && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">
                        {company.address}
                      </p>
                    </div>
                  )}

                  {/* Images and Timestamps */}
                  <div className="mt-4 flex flex-wrap gap-4 items-center text-sm text-gray-500">
                    {company.logo_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Logo available</span>
                        <img src={company.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded" />
                      </div>
                    )}
                    {company.cover_image_url && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Cover available</span>
                        <img src={company.cover_image_url} alt="Cover" className="w-8 h-8 object-cover rounded" />
                      </div>
                    )}
                    {company.created_at && (
                      <span className="flex items-center gap-1">Created: {new Date(company.created_at).toLocaleDateString()}</span>
                    )}
                    {company.updated_at && (
                      <span className="flex items-center gap-1">Updated: {new Date(company.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Testing Notes</h3>
        <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
          <li>This page uses a <strong>server action</strong> instead of an API route</li>
          <li>No authentication required - fetches all company data directly</li>
          <li>Data is fetched server-side and displayed without client-side JavaScript</li>
          <li>Check your terminal/console for detailed debug logs</li>
          <li>Server action location: <code className="bg-blue-100 px-1 rounded">lib/actions/company.ts</code></li>
        </ul>
      </div>

      <div className="mt-4 text-center">
        <div className="bg-gray-100 border border-gray-300 rounded-md p-3">
          <p className="text-gray-700 text-sm">
            <strong>To refresh the test:</strong> Reload this page (F5 or Ctrl+R)
          </p>
        </div>
      </div>
    </div>
  );
}