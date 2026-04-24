import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit3, Save, X, FileText, Loader2, Share2, Check, AlertCircle, Copy } from "lucide-react";
import { toast } from "sonner";

type ContentProject = Doc<"contentProjects">;
type SocialPlatform = "twitter" | "linkedin" | "facebook" | "instagram" | "medium";
export function SocialPostsEditor({ project }: { project: ContentProject }) {
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
                                        className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
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