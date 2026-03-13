"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { getForms, deleteForm } from "@/app/admin/forms/actions"; // Updated import
import type { FormDefinition } from "@/types/forms";
import { FormBuilderDialog } from "./form-builder-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FormsManagementClient() {
  const router = useRouter();
  const [forms, setForms] = useState<FormDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<FormDefinition | null>(null);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const formsData = await getForms();
      setForms(formsData);
    } catch (error) {
      console.error("Error loading forms:", error);
      toast.error("Failed to load forms");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateForm = () => {
    setEditingForm(null);
    setShowFormBuilder(true);
  };

  const handleEditForm = (form: FormDefinition) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };

  const handleViewSubmissions = (form: FormDefinition) => {
    router.push(`/admin/forms/${form.id}/submissions`);
  };

  const handleDeleteForm = async (formId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this form? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await deleteForm(formId);
      if (result.success) {
        toast.success("Form deleted successfully");
        loadForms();
      } else {
        toast.error(result.error || "Failed to delete form");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("An error occurred while deleting the form");
    }
  };

  const handleFormCreated = (form: FormDefinition) => {
    setForms((prev) => [form, ...prev]);
    setShowFormBuilder(false);
    toast.success("Form created successfully");
  };

  const handleFormUpdated = (form: FormDefinition) => {
    setForms((prev) => prev.map((f) => (f.id === form.id ? form : f)));
    setShowFormBuilder(false);
    setEditingForm(null);
    toast.success("Form updated successfully");
  };

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (form.description &&
        form.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    totalForms: forms.length,
    activeForms: forms.filter((f) => f.is_active).length,
    totalSubmissions: 0, // This would come from submissions data
    pendingReviews: 0, // This would come from submissions data
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeForms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Reviews
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateForm} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forms</CardTitle>
          <CardDescription>
            Manage your forms and view submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredForms.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No forms found" : "No forms created yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? `No forms match "${searchTerm}"`
                  : "Create your first form to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {form.description || "No description"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={form.is_active ? "default" : "secondary"}>
                        {form.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(form.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewSubmissions(form)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditForm(form)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteForm(form.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FormBuilderDialog
        open={showFormBuilder}
        onOpenChange={setShowFormBuilder}
        editingForm={editingForm}
        onFormCreated={handleFormCreated}
        onFormUpdated={handleFormUpdated}
      />
    </div>
  );
}
