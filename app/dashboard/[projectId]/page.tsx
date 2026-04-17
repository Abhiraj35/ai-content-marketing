"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  Send,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">
                  {project.blogPost?.title || "Content Project"}
                </h1>
                <p className="text-sm text-muted-foreground">
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
                <span className="text-sm">
                  Generating content... {progress}%
                </span>
              </div>
              <Progress value={progress} />
              <div className="mt-2 flex gap-2">
                {Object.entries(jobs).map(([name, status]) => (
                  <JobStatusBadge key={name} name={name} status={status} />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blog">Blog Post</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email Newsletter</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
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
function BlogPostEditor({ project }: { project: any }) {
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
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  if (!project.blogPost) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {project.status === "generating" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Generating blog post...
          </>
        ) : (
          "Blog post will appear here after generation"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {project.blogPost.readingTime} min read
          </span>
          {project.blogPost.isEdited && (
            <Badge variant="secondary">Edited</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTitle(project.blogPost.title);
              setContent(project.blogPost.content);
              setExcerpt(project.blogPost.excerpt);
              setIsEditing(!isEditing);
            }}
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
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
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
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono"
            />
          </div>
        </div>
      ) : (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold mb-4">{project.blogPost.title}</h1>
          <p className="text-lg text-muted-foreground mb-6 italic">
            {project.blogPost.excerpt}
          </p>
          <div className="whitespace-pre-wrap">{project.blogPost.content}</div>
        </div>
      )}
    </div>
  );
}

// Social Posts Editor Component
function SocialPostsEditor({ project }: { project: any }) {
  const updateSocialPost = useMutation(api.contentProjects.updateSocialPost);
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const platforms = [
    { key: "twitter", label: "Twitter/X", color: "bg-black" },
    { key: "linkedin", label: "LinkedIn", color: "bg-blue-600" },
    { key: "facebook", label: "Facebook", color: "bg-blue-500" },
    { key: "instagram", label: "Instagram", color: "bg-pink-500" },
    { key: "medium", label: "Medium", color: "bg-slate-800" },
  ];

  const handleEdit = (platform: string, text: string) => {
    setEditingPlatform(platform);
    setEditText(text);
  };

  const handleSave = async (platform: string) => {
    try {
      await updateSocialPost({
        projectId: project._id,
        platform: platform as any,
        text: editText,
      });
      toast.success(`${platform} post saved!`);
      setEditingPlatform(null);
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  if (!project.socialPosts) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {project.status === "generating" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Generating social posts...
          </>
        ) : (
          "Social posts will appear here after generation"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {platforms.map((platform) => {
          const post = project.socialPosts[platform.key];
          return (
            <div key={platform.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                  <span className="font-medium">{platform.label}</span>
                  {post.status === "published" && (
                    <Badge variant="default" className="ml-2">
                      Published
                    </Badge>
                  )}
                  {post.error && (
                    <Badge variant="destructive" className="ml-2">
                      Error
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(post.text)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(platform.key, post.text)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingPlatform === platform.key ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(platform.key)}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPlatform(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{post.text}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Email Editor Component
function EmailEditor({ project }: { project: any }) {
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
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  if (!project.emailNewsletter) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {project.status === "generating" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Generating email newsletter...
          </>
        ) : (
          "Email newsletter will appear here after generation"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Lines */}
      <div>
        <Label className="text-lg font-semibold">Subject Lines</Label>
        <div className="space-y-2 mt-2">
          {project.emailNewsletter.subjectLines.map(
            (subject: string, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 ${
                  selectedSubject === idx ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedSubject(idx)}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    selectedSubject === idx
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  }`}
                />
                <span>{subject}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Email Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-lg font-semibold">Email Content</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
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
              <Label>HTML Content</Label>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>Plain Text Version</Label>
              <Textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                rows={10}
              />
            </div>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <>
            <div className="border rounded-lg p-4 bg-white">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: project.emailNewsletter.htmlContent,
                }}
              />
            </div>
            <div className="mt-4">
              <Label className="text-sm font-medium">Plain Text Preview</Label>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
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
function SeoEditor({ project }: { project: any }) {
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
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  if (!project.seoMetadata) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {project.status === "generating" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            Generating SEO metadata...
          </>
        ) : (
          "SEO metadata will appear here after generation"
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            if (!isEditing) {
              setTitle(project.seoMetadata.title);
              setDescription(project.seoMetadata.description);
              setKeywords(project.seoMetadata.keywords.join(", "));
              setSlug(project.seoMetadata.slug);
            }
            setIsEditing(!isEditing);
          }}
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
            <Label>Meta Title ({title.length}/60 chars)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
            />
          </div>
          <div>
            <Label>Meta Description ({description.length}/160 chars)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={160}
            />
          </div>
          <div>
            <Label>Keywords (comma-separated)</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div>
            <Label>URL Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold">Meta Title</Label>
            <p className="text-lg text-blue-600 mt-1">
              {project.seoMetadata.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {project.seoMetadata.title.length} characters
            </p>
          </div>

          <div>
            <Label className="text-lg font-semibold">Meta Description</Label>
            <p className="text-gray-600 mt-1">
              {project.seoMetadata.description}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {project.seoMetadata.description.length} characters
            </p>
          </div>

          <div>
            <Label className="text-lg font-semibold">Keywords</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.seoMetadata.keywords.map(
                (keyword: string, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {keyword}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold">URL Slug</Label>
            <p className="font-mono text-sm bg-muted p-2 rounded mt-1">
              /blog/{project.seoMetadata.slug}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    draft: "bg-gray-500",
    generating: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <Badge className={`${variants[status] || "bg-gray-500"} text-white`}>
      {status === "generating" && (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function JobStatusBadge({ name, status }: { name: string; status?: string }) {
  const icons: Record<string, React.ReactNode> = {
    pending: <span className="h-2 w-2 rounded-full bg-gray-300" />,
    running: <Loader2 className="h-3 w-3 animate-spin" />,
    completed: <Check className="h-3 w-3 text-green-500" />,
    failed: <AlertCircle className="h-3 w-3 text-red-500" />,
  };

  return (
    <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
      {icons[status || "pending"]}
      <span className="capitalize">
        {name.replace(/([A-Z])/g, " $1").trim()}
      </span>
    </div>
  );
}
