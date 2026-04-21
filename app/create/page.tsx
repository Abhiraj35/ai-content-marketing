"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sprout, ArrowLeft, Loader2, Sparkles, Leaf, FileText, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const router = useRouter();
  const { userId } = useAuth();
  const createProject = useMutation(api.contentProjects.createProject);

  const [inputType, setInputType] = useState<"topic" | "article">("topic");
  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please sign in to create content");
      return;
    }

    const inputContent = inputType === "topic" ? topic : article;

    if (!inputContent.trim()) {
      toast.error(
        inputType === "topic"
          ? "Please enter a topic"
          : "Please paste an article"
      );
      return;
    }

    if (inputType === "topic" && inputContent.length < 10) {
      toast.error("Topic must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create project in Convex
      const projectId = await createProject({
        inputType,
        inputContent: inputContent.trim(),
      });

      // Trigger Inngest workflow
      await fetch("/api/trigger-inngest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          inputType,
          inputContent: inputContent.trim(),
        }),
      });

      toast.success("Your content seed has been planted! Growing now...");
      router.push(`/dashboard/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to plant your content seed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleTopics = [
    "The Future of Remote Work in 2024",
    "Sustainable Living: Small Changes, Big Impact",
    "How AI is Transforming Healthcare",
    "The Art of Mindful Productivity",
  ];

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-[#E7E5E4]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
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
            <Sprout className="w-5 h-5 text-amber-600" />
            <span 
              className="font-bold text-[#431407]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Plant a New Seed
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
            <div className="relative">
              <Sprout className="w-10 h-10 text-amber-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-400 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 
            className="text-3xl sm:text-4xl font-bold text-[#431407] mb-4"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            What will you grow today?
          </h1>
          <p className="text-[#78716C] max-w-lg mx-auto">
            Enter a topic or paste an article, and watch as AI transforms it into 
            a complete content ecosystem.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-[#E7E5E4] p-6 sm:p-8">
          <Tabs
            value={inputType}
            onValueChange={(v) => setInputType(v as "topic" | "article")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-[#F5F5F4] p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="topic"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Enter Topic</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="article"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg py-3 transition-all"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Paste Article</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-[#431407] font-medium">
                  Your Topic
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., The Future of AI in Content Marketing"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isSubmitting}
                  className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl py-6 text-lg"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#78716C]">
                    Minimum 10 characters
                  </p>
                  <span className="text-sm text-[#78716C]">
                    {topic.length} characters
                  </span>
                </div>
              </div>

              {/* Example Topics */}
              <div className="pt-4">
                <p className="text-sm text-[#78716C] mb-3">Need inspiration? Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleTopics.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setTopic(example)}
                      className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="article" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="article" className="text-[#431407] font-medium">
                  Your Article
                </Label>
                <Textarea
                  id="article"
                  placeholder="Paste your full article here..."
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  disabled={isSubmitting}
                  rows={8}
                  className="border-[#E7E5E4] focus:border-amber-400 focus:ring-amber-400 rounded-xl resize-none"
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#78716C]">
                    We&#39;ll extract key insights and repurpose it
                  </p>
                  <span className="text-sm text-[#78716C]">
                    {article.length} characters
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-6 text-lg rounded-xl shadow-soft-lg transition-all duration-300 hover:scale-[1.02]"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Planting your seed...
                </>
              ) : (
                <>
                  <Leaf className="h-5 w-5 mr-2" />
                  Plant &amp; Grow Content
                  <Sparkles className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-[#78716C] mt-4">
              This will generate: Blog post, Social media posts, Email newsletter, and SEO metadata
            </p>
          </div>
        </div>

        {/* What You'll Get */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "Blog Post", color: "bg-amber-50 text-amber-600" },
            { icon: Sprout, label: "Social Posts", color: "bg-teal-50 text-teal-600" },
            { icon: Sparkles, label: "Newsletter", color: "bg-orange-50 text-orange-600" },
            { icon: Lightbulb, label: "SEO Meta", color: "bg-purple-50 text-purple-600" },
          ].map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-[#E7E5E4] shadow-soft"
            >
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#431407]">{item.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
