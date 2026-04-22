"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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

type ContentProject = Doc<"contentProjects">;

type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "medium";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"contentProjects">;

  const project = useQuery(api.contentProjects.getProject, { projectId });

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
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-[#E7E5E4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#78716C] hover:text-[#431407] hover:bg-amber-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#431407]">
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
              <div className="h-2 bg-[#E7E5E4] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500 animate-progress"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-[#F5F5F4] p-1 rounded-xl">
            <TabsTrigger 
              value="blog"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Blog Post</span>
            </TabsTrigger>
            <TabsTrigger 
              value="social"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Social Media</span>
            </TabsTrigger>
            <TabsTrigger 
              value="email"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Newsletter</span>
            </TabsTrigger>
            <TabsTrigger 
              value="seo"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>SEO</span>
            </TabsTrigger>
          </TabsList>

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
  );
}

// Blog Post Editor Component
function BlogPostEditor({ project }: { project: ContentProject }) {
  const updateBlogPost = useMutation(api.contentProjects.updateBlogPost);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.blogPost?.title || "");
  const [content, setContent] = useState(project.blogPost?.content || "");
  const [excerpt, setExcerpt] = useState(project.blogPost?.excerpt || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when project updates
  useEffect(() => {
    if (project.blogPost && !project.blogPost.isEdited) {
      setTitle(project.blogPost.title);
      setContent(project.blogPost.content);
      setExcerpt(project.blogPost.excerpt);
    }
  }, [project.blogPost]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBlogPost({
        projectId: project._id,
        title,
        content,
        excerpt,
      });
      toast.success("Blog post saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!project.blogPost) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl border border-[#E7E5E4] shadow-soft">
        {project.status === "generating" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
            <p className="text-[#431407] font-medium">
              Growing your blog post...
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              This usually takes 15-20 seconds
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-[#A8A29E]" />
            </div>
            <p className="text-[#78716C]">
              Blog post will appear here after generation
            </p>
          </>
        )}
      </div>
    );
  }

  const blogPost = project.blogPost;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-soft p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#431407]">Blog Post</h3>
            <p className="text-sm text-[#78716C]">
              {blogPost.readingTime} min read
              {blogPost.isEdited && (
                <Badge className="ml-2 bg-amber-100 text-amber-700 border-amber-200">
                  Edited
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle(blogPost.title);
              setContent(blogPost.content);
              setExcerpt(blogPost.excerpt);
              setIsEditing(!isEditing);
            }}
            className="border-[#E7E5E4] hover:bg-amber-50 hover:text-amber-700"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          {isEditing && (
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label className="text-[#431407] font-medium">Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-[#431407] font-medium">Excerpt</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-[#431407] font-medium">Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
        </div>
      ) : (
        <div className="prose prose-amber max-w-none">
          <h1 className="text-3xl font-bold text-[#431407] mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {blogPost.title}
          </h1>
          <p className="text-lg text-[#78716C] mb-6 italic border-l-4 border-amber-400 pl-4">
            {blogPost.excerpt}
          </p>
          <div className="whitespace-pre-wrap text-[#431407] leading-relaxed">
            {blogPost.content}
          </div>
        </div>
      )}
    </div>
  );
}

// Social Posts Editor Component
function SocialPostsEditor({ project }: { project: ContentProject }) {
  const updateSocialPost = useMutation(api.contentProjects.updateSocialPost);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const platforms: {
    key: SocialPlatform;
    label: string;
    color: string;
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "twitter", label: "Twitter/X", color: "bg-black", bg: "bg-gray-100", icon: Share2 },
    { key: "linkedin", label: "LinkedIn", color: "bg-blue-600", bg: "bg-blue-50", icon: Share2 },
    { key: "facebook", label: "Facebook", color: "bg-blue-500", bg: "bg-blue-50", icon: Share2 },
    { key: "instagram", label: "Instagram", color: "bg-pink-500", bg: "bg-pink-50", icon: Share2 },
    { key: "medium", label: "Medium", color: "bg-slate-800", bg: "bg-slate-50", icon: FileText },
  ];

  const handleEdit = (platform: string, text: string) => {
    setEditingPlatform(platform);
    setEditText(text);
  };

  const handleSave = async (platform: string) => {
    try {
      await updateSocialPost({
        projectId: project._id,
        platform: platform as SocialPlatform,
        text: editText,
      });
      toast.success(`${platform} post saved!`);
      setEditingPlatform(null);
    } catch {
      toast.error("Failed to save");
    }
  };

  if (!project.socialPosts) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl border border-[#E7E5E4] shadow-soft">
        {project.status === "generating" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
            <p className="text-[#431407] font-medium">
              Growing your social posts...
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              This usually takes 10-15 seconds
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-[#A8A29E]" />
            </div>
            <p className="text-[#78716C]">
              Social posts will appear here after generation
            </p>
          </>
        )}
      </div>
    );
  }

  const socialPosts = project.socialPosts;

  return (
    <div className="space-y-4">
      {platforms.map((platform) => {
        const post = socialPosts[platform.key];
        return (
          <div 
            key={platform.key} 
            className="bg-white rounded-xl border border-[#E7E5E4] shadow-soft p-5 card-lift"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                <span className="font-medium text-[#431407]">{platform.label}</span>
                {post.status === "published" && (
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                    <Check className="w-3 h-3 mr-1" />
                    Published
                  </Badge>
                )}
                {post.error && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(post.text);
                    toast.success("Copied to clipboard!");
                  }}
                  className="text-[#78716C] hover:text-amber-600 hover:bg-amber-50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(platform.key, post.text)}
                  className="text-[#78716C] hover:text-amber-600 hover:bg-amber-50"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {editingPlatform === platform.key ? (
              <div className="space-y-3">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSave(platform.key)}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPlatform(null)}
                    className="border-[#E7E5E4] hover:bg-amber-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#431407] whitespace-pre-wrap bg-[#FFFBEB] p-4 rounded-lg border border-[#E7E5E4]">
                {post.text}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Email Editor Component
function EmailEditor({ project }: { project: ContentProject }) {
  const updateEmailNewsletter = useMutation(
    api.contentProjects.updateEmailNewsletter,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [htmlContent, setHtmlContent] = useState(
    project.emailNewsletter?.htmlContent || "",
  );
  const [plainText, setPlainText] = useState(
    project.emailNewsletter?.plainText || "",
  );
  const [selectedSubject, setSelectedSubject] = useState(
    project.emailNewsletter?.selectedSubjectLine || 0,
  );

  const handleSave = async () => {
    try {
      await updateEmailNewsletter({
        projectId: project._id,
        htmlContent,
        plainText,
        selectedSubjectLine: selectedSubject,
      });
      toast.success("Email newsletter saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  if (!project.emailNewsletter) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl border border-[#E7E5E4] shadow-soft">
        {project.status === "generating" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
            <p className="text-[#431407] font-medium">
              Writing your newsletter...
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              This usually takes 10-15 seconds
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-[#A8A29E]" />
            </div>
            <p className="text-[#78716C]">
              Email newsletter will appear here after generation
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-soft p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
          <Mail className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-bold text-[#431407]">Email Newsletter</h3>
          <p className="text-sm text-[#78716C]">
            {project.emailNewsletter.subjectLines.length} subject line options
          </p>
        </div>
      </div>

      {/* Subject Lines */}
      <div className="mb-8">
        <Label className="text-lg font-semibold text-[#431407] mb-3 block">
          Choose a Subject Line
        </Label>
        <div className="space-y-2">
          {project.emailNewsletter.subjectLines.map(
            (subject: string, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedSubject === idx 
                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" 
                    : "border-[#E7E5E4] hover:border-amber-300 hover:bg-amber-50/50"
                }`}
                onClick={() => setSelectedSubject(idx)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedSubject === idx
                        ? "border-amber-500 bg-amber-500"
                        : "border-[#D6D3D1]"
                    }`}
                  >
                    {selectedSubject === idx && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-[#431407]">{subject}</span>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Email Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-semibold text-[#431407]">
            Email Content
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-[#E7E5E4] hover:bg-amber-50 hover:text-amber-700"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-[#431407] font-medium">HTML Content</Label>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="font-mono text-xs border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-[#431407] font-medium">Plain Text Version</Label>
              <Textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={10}
                className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
              />
            </div>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <>
            <div className="border border-[#E7E5E4] rounded-xl p-6 bg-[#FFFBEB]">
              <div
                className="prose prose-amber max-w-none"
                dangerouslySetInnerHTML={{
                  __html: project.emailNewsletter.htmlContent,
                }}
              />
            </div>
            <div className="mt-6">
              <Label className="text-sm font-medium text-[#78716C] mb-2 block">
                Plain Text Preview
              </Label>
              <pre className="p-4 bg-[#F5F5F4] rounded-xl text-sm whitespace-pre-wrap text-[#431407]">
                {project.emailNewsletter.plainText}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// SEO Editor Component
function SeoEditor({ project }: { project: ContentProject }) {
  const updateSeoMetadata = useMutation(api.contentProjects.updateSeoMetadata);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.seoMetadata?.title || "");
  const [description, setDescription] = useState(
    project.seoMetadata?.description || "",
  );
  const [keywords, setKeywords] = useState(
    project.seoMetadata?.keywords?.join(", ") || "",
  );
  const [slug, setSlug] = useState(project.seoMetadata?.slug || "");

  const handleSave = async () => {
    try {
      await updateSeoMetadata({
        projectId: project._id,
        title,
        description,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        slug,
      });
      toast.success("SEO metadata saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save");
    }
  };

  if (!project.seoMetadata) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl border border-[#E7E5E4] shadow-soft">
        {project.status === "generating" ? (
          <>
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <p className="text-[#431407] font-medium">
              Optimizing SEO metadata...
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              This usually takes 5-10 seconds
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#F5F5F4] flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-[#A8A29E]" />
            </div>
            <p className="text-[#78716C]">
              SEO metadata will appear here after generation
            </p>
          </>
        )}
      </div>
    );
  }

  const seoMetadata = project.seoMetadata;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-soft p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
          <Globe className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-[#431407]">SEO Metadata</h3>
          <p className="text-sm text-[#78716C]">
            Optimized for search engines
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          variant="outline"
          onClick={() => {
            if (!isEditing) {
              setTitle(seoMetadata.title);
              setDescription(seoMetadata.description);
              setKeywords(seoMetadata.keywords.join(", "));
              setSlug(seoMetadata.slug);
            }
            setIsEditing(!isEditing);
          }}
          className="border-[#E7E5E4] hover:bg-amber-50 hover:text-amber-700"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <Label className="text-[#431407] font-medium">
              Meta Title ({title.length}/60 chars)
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-[#431407] font-medium">
              Meta Description ({description.length}/160 chars)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={160}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-[#431407] font-medium">
              Keywords (comma-separated)
            </Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-[#431407] font-medium">URL Slug</Label>
            <Input 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)}
              className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl"
            />
          </div>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold text-[#431407] block mb-2">
              Meta Title
            </Label>
            <p className="text-lg text-amber-600 font-medium">
              {seoMetadata.title}
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              {seoMetadata.title.length} characters (max 60)
            </p>
          </div>

          <div>
            <Label className="text-lg font-semibold text-[#431407] block mb-2">
              Meta Description
            </Label>
            <p className="text-[#431407] leading-relaxed">
              {seoMetadata.description}
            </p>
            <p className="text-sm text-[#78716C] mt-1">
              {seoMetadata.description.length} characters (max 160)
            </p>
          </div>

          <div>
            <Label className="text-lg font-semibold text-[#431407] block mb-3">
              Keywords
            </Label>
            <div className="flex flex-wrap gap-2">
              {seoMetadata.keywords.map(
                (keyword: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                  >
                    {keyword}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold text-[#431407] block mb-2">
              URL Slug
            </Label>
            <div className="flex items-center gap-2 p-3 bg-[#F5F5F4] rounded-xl border border-[#E7E5E4]">
              <span className="text-[#78716C]">/blog/</span>
              <span className="font-mono text-amber-600">{seoMetadata.slug}</span>
            </div>
          </div>
        </div>
      )}
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
