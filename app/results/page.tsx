"use client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MermaidChart } from "@/components/mermaid-chart";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  FileDown,
  RefreshCw,
  Download,
  Wand2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/db";
import { generatePlan, refinePlan } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { GradientBackground } from "@/components/gradient-bg";
import { motion } from "framer-motion";
import { toast } from "sonner";
import jsPDF from "jspdf";
import Link from "next/link";

// interface ResultData {
//   problem_statement: string;
//   features: string[];
//   tech_stack: string[];
//   roadmap: Array<{ phase: string; tasks: string[] }>;
//   other_notes: string;
// }

interface ResultData {
  //builder_type: "student" | "founder" | "hobbyist" | "other"; // captures user persona
  //project_title: string; // project title added for clarity
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
}

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [result, setResult] = useState<ResultData | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [refineDialogOpen, setRefineDialogOpen] = useState(false);
  const [showMermaid, setShowMermaid] = useState(false);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      if (!projectId) {
        router.push("/dashboard");
        return;
      }

      await loadProjectAndResult();
    };
    checkAuthAndLoad();
  }, [router, projectId]);

  const loadProjectAndResult = async () => {
    //console.log("Load proj - 1");
    if (!projectId) return;
    //console.log("Load proj - 2");
    try {
      //console.log("Load proj - 3");
      const projectData = await Database.getProject(projectId);
      //console.log("Load proj - 4");
      if (!projectData) {
        router.push("/dashboard");
        return;
      }
      //console.log("Load proj - 5");
      setProject(projectData);

      const existingResult = await Database.getProjectResult(projectId);
      if (existingResult) {
        //console.log("already there");
        setResult(existingResult);
      } else {
        //console.log("Generate new result");
        // Generate new result
        await generateNewPlan();
      }
    } catch (error) {
      toast.error("Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    //console.log("generating - 1");
    if (!projectId) return;
    //console.log("generating - 2");
    setGenerating(true);
    try {
      //console.log("generating - 3");
      const planResult = await generatePlan(projectId);
      // console.log("In result page.tsx");
      // console.log(planResult);
      //console.log("generating - 4");
      setResult(planResult);
      //console.log("generating - 5");
      toast.success("Project plan generated successfully!");
    } catch (error) {
      toast.error("Failed to generate project plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!projectId || !refineFeedback.trim()) return;

    setRefining(true);
    try {
      const refinedResult = await refinePlan(projectId, refineFeedback);
      setResult(refinedResult);
      setRefineFeedback("");
      setRefineDialogOpen(false);
      toast.success("Project plan refined successfully!");
    } catch (error) {
      toast.error("Failed to refine project plan");
    } finally {
      setRefining(false);
    }
  };

  const exportToPDF = () => {
    if (!result || !project) return;

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
    addWrappedText(result.problem_statement);

    // Key Features
    if (result.features?.length) {
      addSectionTitle("Key Features:");
      addBulletPoints(result.features);
    }

    // Tech Stack
    if (result.tech_stack?.length) {
      addSectionTitle("Technology Stack:");
      addBulletPoints(result.tech_stack);
    }

    // Roadmap
    if (result.roadmap?.length) {
      addSectionTitle("Roadmap:");

      result.roadmap.forEach((phase) => {
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
    if (result.success_metrics?.length) {
      addSectionTitle("Success Metrics:");
      addBulletPoints(result.success_metrics);
    }

    // Risks and Mitigations
    if (result.risks_and_mitigations?.length) {
      addSectionTitle("Risks & Mitigations:");
      result.risks_and_mitigations.forEach((item) => {
        pdf.setFontSize(10);
        pdf.text(`Risk: ${item.risk}`, marginLeft + 5, yPosition);
        yPosition += 6;
        pdf.text(`Mitigation: ${item.mitigation}`, marginLeft + 10, yPosition);
        yPosition += 10;
      });
    }

    // Future Scope
    if (result.future_scope?.length) {
      addSectionTitle("Future Scope:");
      addBulletPoints(result.future_scope);
    }

    // Integrations
    if (result.integrations?.length) {
      addSectionTitle("Integrations:");
      addBulletPoints(result.integrations);
    }

    // Cost Estimate
    if (result.cost_estimate) {
      addSectionTitle("Cost & Resource Estimate:");
      addWrappedText(result.cost_estimate);
    }

    // Roles and Responsibilities
    if (result.roles_and_responsibilities?.length) {
      addSectionTitle("Roles & Responsibilities:");
      addBulletPoints(result.roles_and_responsibilities);
    }

    // Other Notes
    if (result.other_notes) {
      addSectionTitle("Other Notes:");
      addWrappedText(result.other_notes);
    }

    pdf.save(`${project.title}-project-plan.pdf`);
    toast.success("PDF exported successfully!");
  };

  const exportToMarkdown = () => {
    if (!result || !project) return;

    let markdown = `# ${project.title}\n\n`;

    // Builder type
    // if (result.builder_type) {
    //   markdown += `**Builder Type:** ${result.builder_type}\n\n`;
    // }

    // Problem statement
    markdown += `## Problem Statement\n${result.problem_statement}\n\n`;

    // Key Features
    if (result.features?.length) {
      markdown += `## Key Features\n${result.features
        .map((f) => `- ${f}`)
        .join("\n")}\n\n`;
    }

    // Technology Stack
    if (result.tech_stack?.length) {
      markdown += `## Technology Stack\n${result.tech_stack
        .map((t) => `- ${t}`)
        .join("\n")}\n\n`;
    }

    // Roadmap
    if (result.roadmap?.length) {
      markdown += `## Roadmap\n`;
      result.roadmap.forEach((phase) => {
        markdown += `### ${phase.phase}\n${phase.tasks
          .map((t) => `- ${t}`)
          .join("\n")}\n\n`;
      });
    }

    // Success Metrics
    if (result.success_metrics?.length) {
      markdown += `## Success Metrics\n${result.success_metrics
        .map((m) => `- ${m}`)
        .join("\n")}\n\n`;
    }

    // Risks and Mitigations
    if (result.risks_and_mitigations?.length) {
      markdown += `## Risks and Mitigations\n`;
      result.risks_and_mitigations.forEach((item) => {
        markdown += `- **Risk:** ${item.risk}\n  - **Mitigation:** ${item.mitigation}\n`;
      });
      markdown += "\n";
    }

    // Future Scope
    if (result.future_scope?.length) {
      markdown += `## Future Scope\n${result.future_scope
        .map((s) => `- ${s}`)
        .join("\n")}\n\n`;
    }

    // Integrations
    if (result.integrations?.length) {
      markdown += `## Integrations\n${result.integrations
        .map((i) => `- ${i}`)
        .join("\n")}\n\n`;
    }

    // Cost Estimate
    if (result.cost_estimate) {
      markdown += `## Cost Estimate\n${result.cost_estimate}\n\n`;
    }

    // Roles and Responsibilities
    if (result.roles_and_responsibilities?.length) {
      markdown += `## Roles and Responsibilities\n${result.roles_and_responsibilities
        .map((r) => `- ${r}`)
        .join("\n")}\n\n`;
    }

    // Additional Notes
    if (result.other_notes) {
      markdown += `## Additional Notes\n${result.other_notes}\n\n`;
    }

    // Refinement History
    if (result.refinement_history?.length) {
      markdown += `## Refinement History\n`;
      result.refinement_history.forEach((entry) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} />
          <h2 className="text-2xl font-semibold">
            Generating Your Project Plan
          </h2>
          <p className="text-muted-foreground">
            Our AI is analyzing your responses and creating a comprehensive
            plan...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientBackground />
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              Failed to generate project plan
            </p>
            <Button onClick={generateNewPlan}>Try Again</Button>
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
            {result && (
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

          {/* Problem Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">
                {result.problem_statement}
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
                {result.features.map((feature, index) => (
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
                {result.tech_stack.map((tech, index) => (
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

          {/* Roadmap */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Development Roadmap</CardTitle>
              <CardDescription>
                Phased approach to building your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {result.roadmap.map((phase, phaseIndex) => (
                  <motion.div
                    key={phaseIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: phaseIndex * 0.1 }}
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
                          <span className="text-muted-foreground">{task}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card> */}

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
                  <MermaidChart chart={roadmapToMermaid(result.roadmap)} />
                </>
              ) : (
                <div className="space-y-6">
                  {result.roadmap.map((phase, phaseIndex) => (
                    <motion.div
                      key={phaseIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: phaseIndex * 0.1 }}
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
          {result.other_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {result.other_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success Metrics */}
          {result.success_metrics && result.success_metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
                <CardDescription>
                  Key indicators to measure project success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {result.success_metrics.map((metric, index) => (
                    <li key={index} className="text-muted-foreground">
                      {metric}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Risks & Mitigations */}
          {result.risks_and_mitigations &&
            result.risks_and_mitigations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Risks & Mitigations</CardTitle>
                  <CardDescription>
                    Anticipated challenges and how to address them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.risks_and_mitigations.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-muted/50 space-y-1"
                      >
                        <p className="font-semibold">Risk: {item.risk}</p>
                        <p className="text-muted-foreground">
                          Mitigation: {item.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Future Scope */}
          {result.future_scope && result.future_scope.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Future Scope</CardTitle>
                <CardDescription>
                  Potential enhancements beyond the MVP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {result.future_scope.map((feature, index) => (
                    <li key={index} className="text-muted-foreground">
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Integrations */}
          {result.integrations && result.integrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Suggested APIs and external services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.integrations.map((integration, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 text-sm"
                    >
                      {integration}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Estimate */}
          {result.cost_estimate && (
            <Card>
              <CardHeader>
                <CardTitle>Cost & Resource Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.cost_estimate}</p>
              </CardContent>
            </Card>
          )}

          {/* Roles & Responsibilities */}
          {result.roles_and_responsibilities &&
            result.roles_and_responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Responsibilities</CardTitle>
                  <CardDescription>
                    Suggested roles for team projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.roles_and_responsibilities.map((role, index) => (
                      <li key={index} className="text-muted-foreground">
                        {role}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
        </motion.div>
      </div>
    </div>
  );
}
