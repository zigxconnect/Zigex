"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { ProgramCurriculum } from "./ProgramCurriculum";

interface Tutor {
  name: string;
  email?: string;
  bio?: string;
  picture?: string;
  expertise?: string[];
}

interface Module {
  id: string;
  title: string;
  moduleNumber: number;
  tutors: Tutor[];
  description?: string;
}

interface AdminCurriculumManagerProps {
  programId: string;
  programTitle: string;
}

export function AdminCurriculumManager({
  programId,
  programTitle,
}: AdminCurriculumManagerProps) {
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModule, setNewModule] = useState<Omit<Module, "id">>({
    title: "",
    moduleNumber: 1,
    tutors: [],
    description: "",
  });
  const [newTutor, setNewTutor] = useState<Tutor>({
    name: "",
    email: "",
    bio: "",
    picture: "",
    expertise: [],
  });

  const handleAddTutor = () => {
    if (newTutor.name.trim()) {
      setNewModule({
        ...newModule,
        tutors: [...newModule.tutors, newTutor],
      });
      setNewTutor({
        name: "",
        email: "",
        bio: "",
        picture: "",
        expertise: [],
      });
    }
  };

  const handleRemoveTutor = (index: number) => {
    setNewModule({
      ...newModule,
      tutors: newModule.tutors.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-2xl">📚</div>
          <div className="flex-1">
            <div className="font-semibold text-blue-900">Local Curriculum Management</div>
            <p className="text-sm text-blue-800 mt-1">
              All curriculum data is stored locally in browsers. This saves database space and ensures fast access.
              Students will receive email notifications when you add new modules.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Module Form */}
      {showAddModule && (
        <Card className="p-6 border-2 border-blue-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Add New Module</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddModule(false)}
              >
                <X size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold block mb-2">
                  Module Title
                </label>
                <Input
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                  placeholder="e.g., Week 1: Introduction"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">
                  Module Number
                </label>
                <Input
                  type="number"
                  value={newModule.moduleNumber}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      moduleNumber: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2">
                Description
              </label>
              <textarea
                value={newModule.description}
                onChange={(e) =>
                  setNewModule({ ...newModule, description: e.target.value })
                }
                placeholder="What will students learn in this module?"
                className="w-full p-3 border rounded-lg"
                rows={3}
              />
            </div>

            {/* Tutors Section */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Add Tutors</h4>

              <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-semibold block mb-1">
                    Tutor Name
                  </label>
                  <Input
                    value={newTutor.name}
                    onChange={(e) =>
                      setNewTutor({ ...newTutor, name: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={newTutor.email}
                      onChange={(e) =>
                        setNewTutor({ ...newTutor, email: e.target.value })
                      }
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      Picture URL
                    </label>
                    <Input
                      value={newTutor.picture}
                      onChange={(e) =>
                        setNewTutor({ ...newTutor, picture: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1">Bio</label>
                  <Input
                    value={newTutor.bio}
                    onChange={(e) =>
                      setNewTutor({ ...newTutor, bio: e.target.value })
                    }
                    placeholder="Brief description of the tutor"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1">
                    Expertise (comma-separated)
                  </label>
                  <Input
                    value={newTutor.expertise?.join(", ")}
                    onChange={(e) =>
                      setNewTutor({
                        ...newTutor,
                        expertise: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <Button onClick={handleAddTutor} className="w-full">
                  <Plus size={16} className="mr-2" />
                  Add Tutor to Module
                </Button>
              </div>

              {/* Display Added Tutors */}
              {newModule.tutors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-600">
                    Tutors in this module:
                  </div>
                  {newModule.tutors.map((tutor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                    >
                      <div>
                        <div className="font-semibold text-sm">{tutor.name}</div>
                        <div className="text-xs text-gray-600">{tutor.email}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTutor(idx)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  // This will be called from parent component
                  setShowAddModule(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Save Module
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Curriculum Preview */}
      <div>
        <h3 className="font-bold text-lg mb-4">Curriculum Preview</h3>
        <ProgramCurriculum
          programId={programId}
          isPaid={false}
          paymentStatus="completed"
          programTitle={programTitle}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
