import { Doc } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ContentProject = Doc<"contentProjects">;

export function BlogPostEditor({ project }: { project: ContentProject }) {
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