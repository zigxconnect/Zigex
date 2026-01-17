import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Simplified type for the view
interface InboundPitch {
  id: string;
  status: string;
  project: {
    id: string;
    title: string;
    tagline: string;
    cover_images: string[];
    pitch_deck_url: string;
    owner: {
      email: string; // From join
    };
  };
  submitted_at: string;
}

export default async function ProjectReceivedPage() {
  // fetching logic would go here, usually server-side
  // const supabase = createClient();
  // const { data: pitches } = await supabase.from('project_submissions').select('*, project:projects(*)')...

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Projects Received</h1>
      <p className="text-muted-foreground mb-8">
        Review pitch decks submitted by students.
      </p>

      <div className="grid gap-6">
        {/* Placeholder for when data is fetched */}
        <Card>
           <CardHeader>
             <CardTitle className="text-lg">No pitches received yet.</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-slate-500">
               When students pitch their projects to your company, they will appear here.
             </p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
