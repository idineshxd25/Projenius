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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createProject, getProjects, Project } from "@/lib/api";
import { ProjectCard } from "@/components/project-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { GradientBackground } from "@/components/gradient-bg";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      loadProjects();
    };
    checkAuth();
  }, [router]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    //console.log("Start - 1");
    if (!title.trim() || !description.trim()) return;
    //console.log("Start - 2");

    setCreating(true);
    try {
      //console.log("Start - 3");
      const project = await createProject(title, description);
      //console.log("Start - 4");
      setProjects([project, ...projects]);
      //console.log("Start - 5");
      setTitle("");
      setDescription("");
      setDialogOpen(false);
      toast.success("Project created successfully!");
      //console.log("Start - 6");
      router.push(`/questions?projectId=${project.id}`);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GradientBackground />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">My Projects</h1>
          <p className="text-muted-foreground text-lg">
            Manage and view your AI-generated project plans
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Project Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Card className="h-full border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                    <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      Start New Project
                    </CardTitle>
                    <CardDescription>
                      Create a new AI-powered project plan
                    </CardDescription>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Provide a title and brief description for your project idea
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Project title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Brief description of your project idea..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleCreateProject}
                    disabled={creating || !title.trim() || !description.trim()}
                    className="w-full"
                  >
                    {creating ? (
                      <LoadingSpinner size={16} className="mr-2" />
                    ) : null}
                    Create Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Existing Projects */}
          {projects.length > 0 ? (
            projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index + 1}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-full text-center py-12"
            >
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground">
                Create your first project to get started with AI-powered
                planning
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
