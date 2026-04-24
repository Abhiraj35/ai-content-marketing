"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Cpu,
  FileText,
  Share2,
  Mail,
  Globe,
  Sparkles,
  Box,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Show, UserButton } from "@clerk/nextjs";
import { BlogPostEditor } from "@/components/blocks/blog-post-editor";
import { SocialPostsEditor } from "@/components/blocks/socal-post-editor";
import { EmailEditor } from "@/components/blocks/email-editor";
import { SeoEditor } from "@/components/blocks/seo-editor";
import Link from "next/link";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"contentProjects">;

  const project = useQuery(api.contentProjects.getProject, { projectId });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("blog");

  const tabLinks = [
    {
      label: "Blog Post",
      value: "blog",
      icon: <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />,
    },
    {
      label: "Social Media",
      value: "social",
      icon: <Share2 className="h-4 w-4 shrink-0 text-muted-foreground" />,
    },
    {
      label: "Email",
      value: "email",
      icon: <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />,
    },
    {
      label: "SEO",
      value: "seo",
      icon: <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />,
    },
  ];

  // Redirect if project not found
  useEffect(() => {
    if (project === null) {
      toast.error("Project not found");
      router.push("/");
    }
  }, [project, router]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate progress
  const jobs = project.jobStatus || {};
  const totalJobs = 4;
  const completedJobs = Object.values(jobs).filter(
    (s) => s === "completed",
  ).length;
  const progress = Math.round((completedJobs / totalJobs) * 100);

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col md:grid md:grid-cols-[auto_minmax(0,1fr)]">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="md:sticky md:top-0 md:h-screen md:overflow-hidden justify-between border-r border-white/10 bg-background/50 backdrop-blur-xl">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className={`flex items-center gap-3 py-3 ${sidebarOpen ? "px-1.5" : "justify-center px-0"}`}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                <Cpu className="w-4 h-4 text-primary" />
              </div>
              {sidebarOpen && (
                <Link href="/dashboard" className="flex flex-col gap-1">
                  <p className="text-sm font-semibold tracking-tight text-foreground">InkHive</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspace</p>
                </Link>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-1">
              {tabLinks.map((item) => (
                <SidebarLink
                  key={item.value}
                  link={{ label: item.label, href: `#${item.value}`, icon: item.icon }}
                  className={`rounded-xl border text-sm transition-all ${activeTab === item.value
                    ? "border-white/15 bg-white/5 text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/5 hover:text-foreground"
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.value);
                  }}
                />
              ))}
            </div>
          </div>

          <div className={`space-y-2 pb-4 ${sidebarOpen ? "px-1" : "px-0"}`}>
            <SidebarLink
              link={{
                label: "Back Home",
                href: "/dashboard",
                icon: <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />,
              }}
              className="rounded-xl border border-transparent text-muted-foreground transition-all hover:border-white/10 hover:bg-white/5 hover:text-foreground"
            />
            <Show when="signed-in">
              <div className={`py-2 ${sidebarOpen ? "px-3" : "flex justify-center px-0"}`}>
                <UserButton />
              </div>
            </Show>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="min-w-0 flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Background Gradients */}
        <div aria-hidden className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen hidden lg:block">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                  <Box className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
                    {project.blogPost?.title || "AI Content Task"}
                  </h1>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {project.inputType === "topic"
                      ? "Seed: "
                      : "Source: "}
                    {project.inputType === "topic" ? project.inputContent : "Article Repurposing"}
                  </p>
                </div>
              </div>

              <StatusBadge status={project.status} />
            </div>

            {project.status === "generating" && (
              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    Agents processing... {progress}%
                  </span>
                  <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-white/5">
                    {completedJobs} / {totalJobs} complete
                  </span>
                </div>
                <Progress
                  value={progress}
                  aria-label="Agent processing progress"
                  className="h-1.5 bg-white/10"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(jobs).map(([name, status]) => (
                    <JobStatusBadge key={name} name={name} status={status} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsContent value="blog" className="mt-0 outline-none">
              <BlogPostEditor project={project} />
            </TabsContent>

            <TabsContent value="social" className="mt-0 outline-none">
              <SocialPostsEditor project={project} />
            </TabsContent>

            <TabsContent value="email" className="mt-0 outline-none">
              <EmailEditor project={project} />
            </TabsContent>

            <TabsContent value="seo" className="mt-0 outline-none">
              <SeoEditor project={project} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    draft: {
      bg: "bg-white/5 border-white/10",
      text: "text-muted-foreground",
      icon: null,
    },
    generating: {
      bg: "bg-primary/10 border-primary/20",
      text: "text-primary",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    completed: {
      bg: "bg-green-500/10 border-green-500/20",
      text: "text-green-500",
      icon: <Check className="h-3 w-3" />,
    },
    failed: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-500",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const { bg, text, icon } = config[status] || config.draft;

  return (
    <Badge variant="outline" className={`${bg} ${text} font-medium px-3 py-1 shadow-sm`}>
      <span className="flex items-center gap-1.5">
        {icon}
        <span className="capitalize tracking-wide text-xs">{status}</span>
      </span>
    </Badge>
  );
}

function JobStatusBadge({ name, status }: { name: string; status?: string }) {
  const config: Record<string, { icon: ReactNode; bg: string; text: string }> = {
    pending: {
      icon: <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />,
      bg: "bg-white/5 border border-white/10",
      text: "text-muted-foreground",
    },
    running: {
      icon: <Loader2 className="h-3 w-3 animate-spin text-primary" />,
      bg: "bg-primary/10 border border-primary/20",
      text: "text-primary",
    },
    completed: {
      icon: <Check className="h-3 w-3 text-green-500" />,
      bg: "bg-green-500/10 border border-green-500/20",
      text: "text-green-500",
    },
    failed: {
      icon: <AlertCircle className="h-3 w-3 text-red-500" />,
      bg: "bg-red-500/10 border border-red-500/20",
      text: "text-red-500",
    },
  };

  const { icon, bg, text } = config[status || "pending"];

  return (
    <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md ${bg} ${text} shadow-sm backdrop-blur-sm`}>
      {icon}
      <span className="capitalize font-medium tracking-wide">
        {name.replace(/([A-Z])/g, " $1").trim()}
      </span>
    </div>
  );
}
