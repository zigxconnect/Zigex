import React from 'react';
import { Shield, Plus } from 'lucide-react';

const InternshipPostingCard: React.FC = () => {
  return (
    <div className="max-w-md mx-auto rounded-lg  p-8 text-center">
      {/* Shield Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 bg-[#F1F5F9] rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
      </div>
      
      {/* Main Heading */}
      <h2 className="text-2xl font-semibold text-blue-900 mb-4 leading-tight">
        You haven't posted any<br />
        internships yet
      </h2>
      
      {/* Description Text */}
      <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
        Start building your talent pipeline by creating your first 
        internship posting. Attract the best candidates and 
        grow your team with fresh perspectives.
      </p>
      
      {/* CTA Button */}
      <button className="h-[59px] mx-auto bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 mb-4 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4 text-black" strokeWidth={3} />
        Post Your First Internship
      </button>
      
      {/* Help Text */}
      <p className="text-xs text-slate-500">
        Need help getting started? 
        <span className="text-orange-500 hover:text-orange-600 cursor-pointer ml-1">
          View our posting guide
        </span>
      </p>
    </div>
  );
};

export default InternshipPostingCard;