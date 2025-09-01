"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowLeft,
  FileDown,
  Download,
  Edit,
  Wand2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/db";
import { LoadingSpinner } from "@/components/loading-spinner";
import { GradientBackground } from "@/components/gradient-bg";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import jsPDF from "jspdf";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MermaidChart } from "@/components/mermaid-chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { generatePlan, refinePlan } from "@/lib/api";

interface ProjectWithResult {
  id: string;
  title: string;
  description: string;
  created_at: string;
  result?: {
    problem_statement: string;
    features: string[];
    tech_stack: string[];
    roadmap: Array<{
      phase: string;
      tasks: string[];
    }>;
    success_metrics?: string[]; // optional for flexibility
    risks_and_mitigations?: Array<{
      risk: string;
      mitigation: string;
    }>;
    future_scope?: string[];
    integrations?: string[];
    cost_estimate?: string;
    roles_and_responsibilities?: string[]; // changed to plural for clarity
    other_notes?: string;
    refinement_history?: Array<{
      feedback: string;
      updated_at: string; // ISO timestamp
    }>;
  };
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectWithResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMermaid, setShowMermaid] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [refineDialogOpen, setRefineDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      await loadProject();
    };
    checkAuthAndLoad();
  }, [router, projectId]);

  const loadProject = async () => {
    try {
      const projectData = await Database.getProject(projectId);
      if (!projectData) {
        router.push("/dashboard");
        return;
      }

      const result = await Database.getProjectResult(projectId);
      setProject({
        ...projectData,
        result: result || undefined,
      });
    } catch (error) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!project?.result) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const marginLeft = 20;
    let yPosition = 20;

    const addSectionTitle = (title: string) => {
      pdf.setFontSize(14);
      pdf.text(title, marginLeft, yPosition);
      yPosition += 10;
    };

    const addBulletPoints = (items: string[], indent = 5) => {
      pdf.setFontSize(10);
      items.forEach((item) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`• ${item}`, marginLeft + indent, yPosition);
        yPosition += 7;
      });
      yPosition += 10;
    };

    const addWrappedText = (text: string) => {
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(text, pageWidth - 40);
      lines.forEach((line: any) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, marginLeft, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    };

    // Title
    pdf.setFontSize(20);
    pdf.text(project.title, marginLeft, yPosition);
    yPosition += 15;

    // Problem Statement
    addSectionTitle("Problem Statement:");
    addWrappedText(project.result.problem_statement);

    // Key Features
    if (project.result.features?.length) {
      addSectionTitle("Key Features:");
      addBulletPoints(project.result.features);
    }

    // Tech Stack
    if (project.result.tech_stack?.length) {
      addSectionTitle("Technology Stack:");
      addBulletPoints(project.result.tech_stack);
    }

    // Roadmap
    if (project.result.roadmap?.length) {
      addSectionTitle("Roadmap:");

      project.result.roadmap.forEach((phase) => {
        // Draw a left border before each phase
        pdf.setDrawColor(0, 122, 255); // example primary color
        pdf.setLineWidth(1);
        pdf.line(
          marginLeft - 4,
          yPosition - 10,
          marginLeft - 4,
          yPosition + phase.tasks.length * 7
        );
        const phaseName = phase.phase || ""; // fallback to empty string
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(phaseName, marginLeft, yPosition);
        yPosition += 8;

        // Tasks
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        phase.tasks?.forEach((task) => {
          const taskText = task || ""; // fallback
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.circle(marginLeft + 2, yPosition - 2, 1.5, "F");
          pdf.text(taskText, marginLeft + 8, yPosition);
          yPosition += 7;
        });

        yPosition += 6;
      });
    }

    // Success Metrics
    if (project.result.success_metrics?.length) {
      addSectionTitle("Success Metrics:");
      addBulletPoints(project.result.success_metrics);
    }

    // Risks and Mitigations
    if (project.result.risks_and_mitigations?.length) {
      addSectionTitle("Risks & Mitigations:");
      project.result.risks_and_mitigations.forEach((item) => {
        pdf.setFontSize(10);
        pdf.text(`Risk: ${item.risk}`, marginLeft + 5, yPosition);
        yPosition += 6;
        pdf.text(`Mitigation: ${item.mitigation}`, marginLeft + 10, yPosition);
        yPosition += 10;
      });
    }

    // Future Scope
    if (project.result.future_scope?.length) {
      addSectionTitle("Future Scope:");
      addBulletPoints(project.result.future_scope);
    }

    // Integrations
    if (project.result.integrations?.length) {
      addSectionTitle("Integrations:");
      addBulletPoints(project.result.integrations);
    }

    // Cost Estimate
    if (project.result.cost_estimate) {
      addSectionTitle("Cost & Resource Estimate:");
      addWrappedText(project.result.cost_estimate);
    }

    // Roles and Responsibilities
    if (project.result.roles_and_responsibilities?.length) {
      addSectionTitle("Roles & Responsibilities:");
      addBulletPoints(project.result.roles_and_responsibilities);
    }

    // Other Notes
    if (project.result.other_notes) {
      addSectionTitle("Other Notes:");
      addWrappedText(project.result.other_notes);
    }

    pdf.save(`${project.title}-project-plan.pdf`);
    toast.success("PDF exported successfully!");
  };

  const exportToMarkdown = () => {
    if (!project?.result) return;

    let markdown = `# ${project.title}\n\n`;

    // Builder type
    // if (result.builder_type) {
    //   markdown += `**Builder Type:** ${result.builder_type}\n\n`;
    // }

    // Problem statement
    markdown += `## Problem Statement\n${project.result.problem_statement}\n\n`;

    // Key Features
    if (project.result.features?.length) {
      markdown += `## Key Features\n${project.result.features
        .map((f) => `- ${f}`)
        .join("\n")}\n\n`;
    }

    // Technology Stack
    if (project.result.tech_stack?.length) {
      markdown += `## Technology Stack\n${project.result.tech_stack
        .map((t) => `- ${t}`)
        .join("\n")}\n\n`;
    }

    // Roadmap
    if (project.result.roadmap?.length) {
      markdown += `## Roadmap\n`;
      project.result.roadmap.forEach((phase) => {
        markdown += `### ${phase.phase}\n${phase.tasks
          .map((t) => `- ${t}`)
          .join("\n")}\n\n`;
      });
    }

    // Success Metrics
    if (project.result.success_metrics?.length) {
      markdown += `## Success Metrics\n${project.result.success_metrics
        .map((m) => `- ${m}`)
        .join("\n")}\n\n`;
    }

    // Risks and Mitigations
    if (project.result.risks_and_mitigations?.length) {
      markdown += `## Risks and Mitigations\n`;
      project.result.risks_and_mitigations.forEach((item) => {
        markdown += `- **Risk:** ${item.risk}\n  - **Mitigation:** ${item.mitigation}\n`;
      });
      markdown += "\n";
    }

    // Future Scope
    if (project.result.future_scope?.length) {
      markdown += `## Future Scope\n${project.result.future_scope
        .map((s) => `- ${s}`)
        .join("\n")}\n\n`;
    }

    // Integrations
    if (project.result.integrations?.length) {
      markdown += `## Integrations\n${project.result.integrations
        .map((i) => `- ${i}`)
        .join("\n")}\n\n`;
    }

    // Cost Estimate
    if (project.result.cost_estimate) {
      markdown += `## Cost Estimate\n${project.result.cost_estimate}\n\n`;
    }

    // Roles and Responsibilities
    if (project.result.roles_and_responsibilities?.length) {
      markdown += `## Roles and Responsibilities\n${project.result.roles_and_responsibilities
        .map((r) => `- ${r}`)
        .join("\n")}\n\n`;
    }

    // Additional Notes
    if (project.result.other_notes) {
      markdown += `## Additional Notes\n${project.result.other_notes}\n\n`;
    }

    // Refinement History
    if (project.result.refinement_history?.length) {
      markdown += `## Refinement History\n`;
      project.result.refinement_history.forEach((entry) => {
        markdown += `- **Feedback:** ${entry.feedback}\n  - **Updated At:** ${entry.updated_at}\n`;
      });
      markdown += "\n";
    }

    // Export as file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title}-project-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Markdown exported successfully!");
  };

  const roadmapToMermaid = (
    roadmap: Array<{ phase: string; tasks: string[] }>
  ) => {
    let chart = `graph TD\n\n`;

    roadmap.forEach((phase, phaseIndex) => {
      const phaseId = `P${phaseIndex}`;
      const safePhase = phase.phase.replace(/"/g, "'");
      chart += `${phaseId}["${safePhase}"]\n`;
      chart += `class ${phaseId} phase;\n`;

      phase.tasks.forEach((task, taskIndex) => {
        const taskId = `${phaseId}T${taskIndex}`;
        const safeTask = task.replace(/"/g, "'");
        chart += `  ${taskId}["${safeTask}"]\n`;
        chart += `  ${phaseId} --> ${taskId}\n`;
        chart += `  class ${taskId} task;\n`;
      });

      if (phaseIndex < roadmap.length - 1) {
        chart += `${phaseId} --> P${phaseIndex + 1}\n`;
      }

      chart += `\n`;
    });

    // Styling is the same as before (space-colon syntax)
    chart += `classDef phase fill:#4f46e5 color:#fff stroke:#4338ca stroke-width:2px;\n`;
    chart += `classDef task fill:#e0e7ff color:#1e1b4b stroke:#c7d2fe stroke-width:1px;\n`;

    return chart;
  };

  const handleRefine = async () => {
    if (!projectId || !refineFeedback.trim()) return;

    setRefining(true);
    try {
      const refinedResult = await refinePlan(projectId, refineFeedback);
      //setResult(refinedResult);
      const projectData = await Database.getProject(projectId);
      if (!projectData) {
        router.push("/dashboard");
        return;
      }
      setProject({
        ...projectData,
        result: refinedResult || undefined,
      });
      setRefineFeedback("");
      setRefineDialogOpen(false);
      toast.success("Project plan refined successfully!");
    } catch (error) {
      toast.error("Failed to refine project plan");
    } finally {
      setRefining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Project not found</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mx-4 lg:mx-4">
      <GradientBackground />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left section */}
            <div className="flex flex-col space-y-4">
              {/* Back to Dashboard */}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>

              {/* Title and description */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold break-words">
                  {project.title}
                </h1>
                {/* Uncomment if you need description */}
                {/* <p className="text-muted-foreground mt-2">
        {project.description}
      </p> */}
              </div>
            </div>

            {/* Right section (buttons) */}
            {project.result && (
              <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:space-x-3">
                {/* <Link href={`/results?projectId=${project.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit/Refine
                  </Button>
                </Link> */}
                <Dialog
                  open={refineDialogOpen}
                  onOpenChange={setRefineDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Refine with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Refine Your Project Plan</DialogTitle>
                      <DialogDescription>
                        Provide feedback on what you would like to change or
                        improve
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="e.g., 'Add more mobile-first features' or 'Focus on scalability'"
                        value={refineFeedback}
                        onChange={(e) => setRefineFeedback(e.target.value)}
                        rows={4}
                      />
                      <Button
                        onClick={handleRefine}
                        disabled={refining || !refineFeedback.trim()}
                        className="w-full"
                      >
                        {refining ? (
                          <LoadingSpinner size={16} className="mr-2" />
                        ) : null}
                        Refine Plan
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={exportToMarkdown}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export MD
                </Button>
                <Button size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            )}
          </div>

          <div>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>

          {!project.result ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  This project has not been completed yet.
                </p>
                <Link href={`/questions?projectId=${project.id}`}>
                  <Button>Continue Q&A Flow</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600 font-medium">
                  Plan Generated
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Problem Statement */}
              <Card>
                <CardHeader>
                  <CardTitle>Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">
                    {project.result.problem_statement}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                  <CardDescription>
                    Essential functionality for your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {project.result.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack */}
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                  <CardDescription>
                    Recommended technologies for implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {project.result.tech_stack.map((tech, index) => (
                      // <motion.div
                      //   key={index}
                      //   initial={{ opacity: 0, scale: 0.8 }}
                      //   animate={{ opacity: 1, scale: 1 }}
                      //   transition={{ duration: 0.3, delay: index * 0.05 }}
                      // >
                      //   <Badge
                      //     variant="secondary"
                      //     className="px-3 py-1 text-sm"
                      //   >
                      //     {tech}
                      //   </Badge>
                      // </motion.div>
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tech}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Development Roadmap</CardTitle>
                    <CardDescription>
                      Phased approach to building your project
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                    <Label htmlFor="roadmap-toggle">Mermaid View</Label>
                    <Switch
                      id="roadmap-toggle"
                      checked={showMermaid}
                      onCheckedChange={setShowMermaid}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {showMermaid ? (
                    <>
                      <MermaidChart
                        chart={roadmapToMermaid(project.result.roadmap)}
                      />
                    </>
                  ) : (
                    <div className="space-y-6">
                      {project.result.roadmap.map((phase, phaseIndex) => (
                        <motion.div
                          key={phaseIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: phaseIndex * 0.1,
                          }}
                          className="border-l-4 border-primary pl-6"
                        >
                          <h4 className="text-lg font-semibold mb-3">
                            {phase.phase}
                          </h4>
                          <div className="space-y-2">
                            {phase.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="flex items-start space-x-3"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  {task}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes */}
              {project.result.other_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {project.result.other_notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Success Metrics */}
              {project.result.success_metrics &&
                project.result.success_metrics.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Success Metrics</CardTitle>
                      <CardDescription>
                        Key indicators to measure project success
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {project.result.success_metrics.map((metric, index) => (
                          <li key={index} className="text-muted-foreground">
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Risks & Mitigations */}
              {project.result.risks_and_mitigations &&
                project.result.risks_and_mitigations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Risks & Mitigations</CardTitle>
                      <CardDescription>
                        Anticipated challenges and how to address them
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.result.risks_and_mitigations.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg bg-muted/50 space-y-1"
                            >
                              <p className="font-semibold">Risk: {item.risk}</p>
                              <p className="text-muted-foreground">
                                Mitigation: {item.mitigation}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Future Scope */}
              {project.result.future_scope &&
                project.result.future_scope.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Future Scope</CardTitle>
                      <CardDescription>
                        Potential enhancements beyond the MVP
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {project.result.future_scope.map((feature, index) => (
                          <li key={index} className="text-muted-foreground">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Integrations */}
              {project.result.integrations &&
                project.result.integrations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>
                        Suggested APIs and external services
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.result.integrations.map(
                          (integration, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-3 py-1 text-sm"
                            >
                              {integration}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Cost Estimate */}
              {project.result.cost_estimate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cost & Resource Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {project.result.cost_estimate}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Roles & Responsibilities */}
              {project.result.roles_and_responsibilities &&
                project.result.roles_and_responsibilities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Roles & Responsibilities</CardTitle>
                      <CardDescription>
                        Suggested roles for team projects
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {project.result.roles_and_responsibilities.map(
                          (role, index) => (
                            <li key={index} className="text-muted-foreground">
                              {role}
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
