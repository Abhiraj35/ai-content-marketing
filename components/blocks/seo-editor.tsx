import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, Loader2, Check, Mail, Globe } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

type ContentProject = Doc<"contentProjects">;
export function SeoEditor({ project }: { project: ContentProject }) {
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
                        className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
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
