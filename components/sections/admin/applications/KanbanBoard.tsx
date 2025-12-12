"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Mail, Phone, MoreHorizontal, Clock, GripVertical, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export type Applicant = {
  id: string;
  name: string;
  avatarUrl?: string;
  status: string;
  appliedDate: string;
  internshipTitle: string;
  email?: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
};

const COLUMNS = {
  applied: { 
    id: "applied", 
    title: "Applied", 
    color: "from-blue-500/10 to-blue-500/5 border-blue-200/50", 
    headerColor: "text-blue-700",
    iconColor: "text-blue-500",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  reviewed: { 
    id: "reviewed", 
    title: "Reviewed", 
    color: "from-purple-500/10 to-purple-500/5 border-purple-200/50", 
    headerColor: "text-purple-700",
    iconColor: "text-purple-500",
    badgeColor: "bg-purple-100 text-purple-700"
  },
  interview: { 
    id: "interview", 
    title: "Interview", 
    color: "from-orange-500/10 to-orange-500/5 border-orange-200/50", 
    headerColor: "text-orange-700",
    iconColor: "text-orange-500",
    badgeColor: "bg-orange-100 text-orange-700"
  },
  accepted: { 
    id: "accepted", 
    title: "Accepted", 
    color: "from-green-500/10 to-green-500/5 border-green-200/50", 
    headerColor: "text-green-700",
    iconColor: "text-green-500",
    badgeColor: "bg-green-100 text-green-700"
  },
  rejected: { 
    id: "rejected", 
    title: "Rejected", 
    color: "from-red-500/10 to-red-500/5 border-red-200/50", 
    headerColor: "text-red-700",
    iconColor: "text-red-500",
    badgeColor: "bg-red-100 text-red-700"
  },
};

type KanbanBoardProps = {
  initialData: Applicant[];
  onStatusChange: (applicantId: string, newStatus: string) => void;
};

export const KanbanBoard = ({ initialData, onStatusChange }: KanbanBoardProps) => {
  const [columns, setColumns] = useState(() => {
    const grouped = {
      applied: [] as Applicant[],
      reviewed: [] as Applicant[],
      interview: [] as Applicant[],
      accepted: [] as Applicant[],
      rejected: [] as Applicant[],
    };

    initialData.forEach((applicant) => {
      const status = applicant.status.toLowerCase() as keyof typeof grouped;
      if (grouped[status]) {
        grouped[status].push(applicant);
      } else {
        grouped.applied.push(applicant);
      }
    });

    return grouped;
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnId = source.droppableId as keyof typeof columns;
    const destColumnId = destination.droppableId as keyof typeof columns;

    const sourceColumn = [...columns[sourceColumnId]];
    const destColumn = [...columns[destColumnId]];

    const [movedApplicant] = sourceColumn.splice(source.index, 1);
    
    // Optimistic update
    if (sourceColumnId === destColumnId) {
      sourceColumn.splice(destination.index, 0, movedApplicant);
      setColumns({ ...columns, [sourceColumnId]: sourceColumn });
    } else {
      destColumn.splice(destination.index, 0, { ...movedApplicant, status: destColumnId });
      setColumns({
        ...columns,
        [sourceColumnId]: sourceColumn,
        [destColumnId]: destColumn,
      });
      
      onStatusChange(draggableId, destColumnId);
    }
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <div className="h-full w-full bg-gray-50/50 p-6 rounded-3xl">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-6 overflow-x-auto pb-4">
          {Object.values(COLUMNS).map((column) => (
            <div key={column.id} className="flex-shrink-0 w-[340px] flex flex-col h-full">
              {/* Column Header */}
              <div className={cn(
                "flex items-center justify-between p-4 mb-4 rounded-2xl border backdrop-blur-sm bg-gradient-to-b shadow-sm",
                column.color
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-white/50 shadow-sm", column.iconColor)}>
                    {column.id === 'accepted' ? <CheckCircle2 size={18} /> : 
                     column.id === 'rejected' ? <XCircle size={18} /> : 
                     <Clock size={18} />}
                  </div>
                  <div>
                    <h3 className={cn("font-bold text-sm uppercase tracking-wide", column.headerColor)}>
                      {column.title}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">
                      {columns[column.id as keyof typeof columns].length} Candidates
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              
              {/* Droppable Area */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <ScrollArea className="flex-1 -mx-3 px-3">
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex flex-col gap-3 min-h-[150px] pb-4 transition-all duration-300 rounded-2xl",
                        snapshot.isDraggingOver ? "bg-gray-100/50 ring-2 ring-dashed ring-gray-300/50 p-2" : ""
                      )}
                    >
                      <AnimatePresence>
                        {columns[column.id as keyof typeof columns].map((applicant, index) => (
                          <Draggable
                            key={applicant.id}
                            draggableId={applicant.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={cn(
                                  "group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300",
                                  snapshot.isDragging ? "shadow-2xl ring-2 ring-blue-500/20 rotate-2 scale-105 z-50 cursor-grabbing" : "cursor-grab"
                                )}
                              >
                                {/* Drag Handle Indicator */}
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-20 transition-opacity">
                                  <GripVertical size={16} />
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-gray-100 rounded-full shadow-sm border border-gray-100">
                                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem className="gap-2">
                                        <ArrowRight size={14} /> Move to Next Stage
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="gap-2">
                                        <Mail size={14} /> Send Email
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600 gap-2">
                                        <XCircle size={14} /> Reject Candidate
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                <CardContent className="p-4 pl-5">
                                  {/* Header */}
                                  <div className="flex items-start gap-3 mb-3">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                      <AvatarImage src={applicant.avatarUrl} />
                                      <AvatarFallback className={cn(
                                        "font-bold text-xs",
                                        column.badgeColor
                                      )}>
                                        {applicant.name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                        {applicant.name}
                                      </h4>
                                      <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                                        {applicant.internshipTitle}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Details */}
                                  <div className="space-y-1.5 mb-4">
                                    {applicant.email && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500 truncate hover:text-gray-700 transition-colors">
                                        <div className="p-1 rounded-full bg-gray-50">
                                          <Mail className="w-3 h-3" />
                                        </div>
                                        <span className="truncate">{applicant.email}</span>
                                      </div>
                                    )}
                                    {applicant.phone && (
                                      <div className="flex items-center gap-2 text-xs text-gray-500 truncate hover:text-gray-700 transition-colors">
                                        <div className="p-1 rounded-full bg-gray-50">
                                          <Phone className="w-3 h-3" />
                                        </div>
                                        <span className="truncate">{applicant.phone}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Footer */}
                                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                      <Calendar size={12} />
                                      <span>{new Date(applicant.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5 bg-gray-50 text-gray-500 font-medium border-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                      {getDaysAgo(applicant.appliedDate)}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

