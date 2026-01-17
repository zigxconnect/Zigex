import React from "react";
import { getAdminPitches } from "@/lib/actions/admin/pitches.action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdminPitchesPage() {
  const { data: pitches, success, error } = await getAdminPitches();

  if (!success) {
    return (
      <div className="p-8 text-red-500">
        Error loading pitches: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pitch Management</h1>
          <p className="text-muted-foreground">
            Monitor and review student project pitches to companies.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">Export CSV</Button>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Target Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pitches && pitches.length > 0 ? (
              pitches.map((pitch: any) => (
                <TableRow key={pitch.id}>
                  <TableCell className="font-medium">
                    {pitch.project?.title || "Untitled"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span>{pitch.project?.owner?.full_name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{pitch.project?.owner?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pitch.company?.company_name || "General"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                        pitch.status === 'valid' || pitch.status === 'interested' ? 'default' : 
                        pitch.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                        {pitch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pitch.created_at ? format(new Date(pitch.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/pitches/${pitch.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No pitches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
