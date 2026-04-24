import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";
import { Edit3, Save, X, Loader2, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../ui/label";

type ContentProject = Doc<"contentProjects">;

export function EmailEditor({ project }: { project: ContentProject }) {
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
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSubject === idx
                                    ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
                                    : "border-[#E7E5E4] hover:border-amber-300 hover:bg-amber-50/50"
                                    }`}
                                onClick={() => setSelectedSubject(idx)}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSubject === idx
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
                            className="bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
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