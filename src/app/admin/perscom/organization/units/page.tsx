"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock units data
const mockUnits = [
  {
    id: "unit-001",
    name: "Task Force 160th",
    description:
      "Night Stalkers - Specialized in helicopter operations providing aviation support for special operations forces.",
    type: "Aviation",
    memberCount: 24,
    commander: "CommanderAlpha",
    status: "Active",
  },
  {
    id: "unit-002",
    name: "TACDEVRON2",
    description:
      "Elite maritime special operations force conducting specialized missions worldwide.",
    type: "Maritime",
    memberCount: 18,
    commander: "OperatorBravo",
    status: "Active",
  },
  {
    id: "unit-003",
    name: "Infantry Division",
    description:
      "Ground combat element specializing in direct action missions.",
    type: "Ground",
    memberCount: 32,
    commander: "SniperDelta",
    status: "Active",
  },
  {
    id: "unit-004",
    name: "Combat Support",
    description:
      "Provides logistical and technical support to operational units.",
    type: "Support",
    memberCount: 15,
    commander: "MedicEcho",
    status: "Active",
  },
];

export default function UnitsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [newUnit, setNewUnit] = useState({
    name: "",
    description: "",
    type: "",
  });

  const filteredUnits = mockUnits.filter((unit) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      unit.name.toLowerCase().includes(searchLower) ||
      unit.description.toLowerCase().includes(searchLower) ||
      unit.type.toLowerCase().includes(searchLower)
    );
  });

  const handleAddUnit = () => {
    setNewUnit({ name: "", description: "", type: "" });
    setIsAddUnitOpen(false);
  };

  const handleEditUnit = () => {
    setEditingUnit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Units</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Manage organizational units and structure.
          </p>
        </div>
        <Button
          className="bg-accent hover:bg-accent-darker text-black"
          onClick={() => setIsAddUnitOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Unit
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Search units..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Unit Name
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Commander
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {filteredUnits.map((unit) => (
                <tr
                  key={unit.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{unit.name}</div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-1">
                        {unit.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{unit.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {unit.memberCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {unit.commander}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={unit.status === "Active" ? "accent" : "outline"}
                    >
                      {unit.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUnit(unit)}
                        title="Edit Unit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        title="Delete Unit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUnits.length === 0 && (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-zinc-400">
              No units found matching your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Add Unit Dialog */}
      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Unit</DialogTitle>
            <DialogDescription>
              Create a new organizational unit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input
                id="unit-name"
                value={newUnit.name}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, name: e.target.value })
                }
                placeholder="e.g., Special Operations Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-type">Unit Type</Label>
              <Input
                id="unit-type"
                value={newUnit.type}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, type: e.target.value })
                }
                placeholder="e.g., Ground, Aviation, Maritime"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-description">Description</Label>
              <Textarea
                id="unit-description"
                value={newUnit.description}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, description: e.target.value })
                }
                placeholder="Brief description of the unit's purpose and capabilities"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUnitOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-accent hover:bg-accent-darker text-black"
              onClick={handleAddUnit}
            >
              Add Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Unit Dialog */}
      {editingUnit && (
        <Dialog
          open={!!editingUnit}
          onOpenChange={(open) => !open && setEditingUnit(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Unit</DialogTitle>
              <DialogDescription>Update unit information.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit-name">Unit Name</Label>
                <Input
                  id="edit-unit-name"
                  value={editingUnit.name}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit-type">Unit Type</Label>
                <Input
                  id="edit-unit-type"
                  value={editingUnit.type}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit-description">Description</Label>
                <Textarea
                  id="edit-unit-description"
                  value={editingUnit.description}
                  onChange={(e) =>
                    setEditingUnit({
                      ...editingUnit,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit-commander">Commander</Label>
                <Input
                  id="edit-unit-commander"
                  value={editingUnit.commander}
                  onChange={(e) =>
                    setEditingUnit({
                      ...editingUnit,
                      commander: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit-status">Status</Label>
                <Input
                  id="edit-unit-status"
                  value={editingUnit.status}
                  onChange={(e) =>
                    setEditingUnit({ ...editingUnit, status: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUnit(null)}>
                Cancel
              </Button>
              <Button
                className="bg-accent hover:bg-accent-darker text-black"
                onClick={handleEditUnit}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
