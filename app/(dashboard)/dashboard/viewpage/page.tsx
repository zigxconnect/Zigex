"use client"

import { useState, useEffect } from 'react';
import { Database, RefreshCw, Copy, Check, AlertCircle, Briefcase, Calendar, GraduationCap, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function AggregatedDataViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    internships: true,
    events: true,
    programs: true
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/students/aggregated-data');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aggregated-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderDataCards = () => {
    if (!data?.data) return null;

    const sections = [
      { 
        key: 'internships', 
        label: 'Internships', 
        icon: Briefcase, 
        color: 'blue',
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      },
      { 
        key: 'events', 
        label: 'Events', 
        icon: Calendar, 
        color: 'green',
        gradient: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      },
      { 
        key: 'programs', 
        label: 'Programs', 
        icon: GraduationCap, 
        color: 'purple',
        gradient: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      },
    ];

    return sections.map(section => {
      const items = data.data[section.key] || [];
      const isExpanded = expandedSections[section.key];
      
      return (
        <div key={section.key} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Section Header */}
          <div 
            className={`bg-gradient-to-r ${section.gradient} p-4 cursor-pointer`}
            onClick={() => toggleSection(section.key)}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <section.icon size={24} />
                <div>
                  <h3 className="font-bold text-lg">{section.label}</h3>
                  <p className="text-sm opacity-90">{items.length} items</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          {/* Section Content */}
          {isExpanded && (
            <div className="p-4">
              {items.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 ${section.bgColor} border ${section.borderColor} rounded-lg hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 flex-1">{item.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${section.bgColor} ${section.textColor} font-medium`}>
                          {item.category || item.program_category || 'Event'}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${section.textColor} mb-2`}>
                        {item.company || item.organizer}
                      </p>
                      
                      {item.location && (
                        <p className="text-xs text-gray-600 mb-2">📍 {item.location}</p>
                      )}
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="mt-3 flex gap-2 text-xs text-gray-500">
                        {item.type && <span className="px-2 py-1 bg-gray-100 rounded">⏱️ {item.type}</span>}
                        {item.start_date && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            📅 {new Date(item.start_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No {section.label.toLowerCase()} found</p>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Database className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Aggregated Data Viewer
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  API: <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">/api/students/aggregated-data</code>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button
                onClick={copyToClipboard}
                disabled={!data}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              
              <button
                onClick={downloadJSON}
                disabled={!data}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 flex items-start gap-4 shadow-md">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-red-900 text-lg">Error Loading Data</h3>
              <p className="text-sm text-red-700 mt-2">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600 text-lg font-medium">Loading aggregated data...</p>
          </div>
        )}

        {/* Data Display */}
        {!loading && data && (
          <>
            {/* Metadata Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Total Items</p>
                <p className="text-4xl font-bold">{data.metadata?.total_count || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Internships</p>
                <p className="text-4xl font-bold">{data.metadata?.internships_count || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Programs</p>
                <p className="text-4xl font-bold">{data.metadata?.programs_count || 0}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Events</p>
                <p className="text-4xl font-bold">{data.metadata?.events_count || 0}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {['overview', 'json'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Based on Active Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {renderDataCards()}
              </div>
            )}

            {activeTab === 'json' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Raw JSON Response</h3>
                  <span className="text-xs text-gray-500">
                    Generated: {new Date(data.metadata?.timestamp).toLocaleString()}
                  </span>
                </div>
                <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto text-xs leading-relaxed font-mono">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}

            {/* Data Sources Status */}
            {data.metadata?.data_sources && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Data Sources Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(data.metadata.data_sources).map(([key, status]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">{key}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          status.fetched 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {status.fetched ? '✓ Success' : '✗ Failed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Count: {status.count}</p>
                      {status.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {status.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}