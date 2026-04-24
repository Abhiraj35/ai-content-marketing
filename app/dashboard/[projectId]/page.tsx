"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Loader2,
  Edit3,
  Check,
  X,
  Copy,
  AlertCircle,
  Sprout,
  FileText,
  Share2,
  Mail,
  Globe,
  Leaf,
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

type ContentProject = Doc<"contentProjects">;

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
      icon: <FileText className="h-4 w-4 shrink-0 text-[#57534E]" />,
    },
    {
      label: "Social Media",
      value: "social",
      icon: <Share2 className="h-4 w-4 shrink-0 text-[#57534E]" />,
    },
    {
      label: "Email",
      value: "email",
      icon: <Mail className="h-4 w-4 shrink-0 text-[#57534E]" />,
    },
    {
      label: "SEO",
      value: "seo",
      icon: <Globe className="h-4 w-4 shrink-0 text-[#57534E]" />,
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
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
    <div className="min-h-screen bg-background md:grid md:grid-cols-[auto_minmax(0,1fr)]">
      
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="md:sticky md:top-0 md:h-screen md:overflow-hidden justify-between border-r border-white/10"> 
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="flex items-center gap-2 px-2 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <p className="text-sm font-bold text-[#431407]">InkHive</p>
                  <p className="text-xs text-[#78716C]">Project Workspace</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-1">
              {tabLinks.map((item) => (
                <SidebarLink
                  key={item.value}
                  link={{ label: item.label, href: `#${item.value}`, icon: item.icon }}
                  className={`rounded-xl px-3 py-2.5 text-sm  ${activeTab === item.value
                    ? "border border-white/10 bg-white/10 text-[#431407]"
                    : "text-[#57534E] hover:bg-background hover:text-[#431407]"
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.value);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 px-1 ">
            <SidebarLink
              link={{
                label: "Back Home",
                href: "/",
                icon: <ArrowLeft className="h-4 w-4 shrink-0 text-[#57534E]" />,
              }}
              className="rounded-xl px-3 py-2.5 hover:bg-background hover:text-[#431407] border border-white/10"
            />
            <Show when="signed-in">
                <UserButton />

            </Show>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-40  border-b border-white/10 bg-base-100/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#faf0e6]">
                    {project.blogPost?.title || "Content Project"}
                  </h1>
                  <p className="text-xs text-[#78716C]">
                    {project.inputType === "topic"
                      ? "Topic: "
                      : "Article Repurposing"}
                    {project.inputType === "topic" && project.inputContent}
                  </p>
                </div>
              </div>

              <StatusBadge status={project.status} />
            </div>

            {project.status === "generating" && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#431407]">
                    Growing your content... {progress}%
                  </span>
                  <span className="text-xs text-[#78716C]">
                    {completedJobs} of {totalJobs} complete
                  </span>
                </div>
                <Progress
                  value={progress}
                  aria-label="Content generation progress"
                  className="h-2 bg-[#E7E5E4]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(jobs).map(([name, status]) => (
                    <JobStatusBadge key={name} name={name} status={status} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 ">

            <TabsContent value="blog">
              <BlogPostEditor project={project} />
            </TabsContent>

            <TabsContent value="social">
              <SocialPostsEditor project={project} />
            </TabsContent>

            <TabsContent value="email">
              <EmailEditor project={project} />
            </TabsContent>

            <TabsContent value="seo">
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
      bg: "bg-[#F5F5F4]",
      text: "text-[#78716C]",
      icon: null,
    },
    generating: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    completed: {
      bg: "bg-teal-100",
      text: "text-teal-700",
      icon: <Leaf className="h-3 w-3" />,
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const { bg, text, icon } = config[status] || config.draft;

  return (
    <Badge className={`${bg} ${text} border-0 font-medium`}>
      <span className="flex items-center gap-1">
        {icon}
        <span className="capitalize">{status}</span>
      </span>
    </Badge>
  );
}

function JobStatusBadge({ name, status }: { name: string; status?: string }) {
  const config: Record<string, { icon: ReactNode; bg: string; text: string }> = {
    pending: {
      icon: <span className="h-2 w-2 rounded-full bg-[#D6D3D1]" />,
      bg: "bg-[#F5F5F4]",
      text: "text-[#78716C]",
    },
    running: {
      icon: <Loader2 className="h-3 w-3 animate-spin text-amber-600" />,
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    completed: {
      icon: <Check className="h-3 w-3 text-teal-600" />,
      bg: "bg-teal-50",
      text: "text-teal-700",
    },
    failed: {
      icon: <AlertCircle className="h-3 w-3 text-red-600" />,
      bg: "bg-red-50",
      text: "text-red-700",
    },
  };

  const { icon, bg, text } = config[status || "pending"];

  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${bg} ${text}`}>
      {icon}
      <span className="capitalize font-medium">
        {name.replace(/([A-Z])/g, " $1").trim()}
      </span>
    </div>
  );
}
