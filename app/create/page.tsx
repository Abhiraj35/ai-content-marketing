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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
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
          : "Please paste an article",
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

      toast.success("Content generation started!");
      router.push(`/dashboard/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create content project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Create New Content</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>What would you like to create?</CardTitle>
            <CardDescription>
              Enter a topic or paste an article to generate blog posts, social
              media content, and email newsletters.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={inputType}
              onValueChange={(v) => setInputType(v as "topic" | "article")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="topic">Topic</TabsTrigger>
                <TabsTrigger value="article">Article</TabsTrigger>
              </TabsList>

              <TabsContent value="topic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Enter a topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., The Future of AI in Content Marketing"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum 10 characters required
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="article" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="article">Paste your article</Label>
                  <Textarea
                    id="article"
                    placeholder="Paste your full article here..."
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    disabled={isSubmitting}
                    rows={10}
                  />
                  <p className="text-sm text-muted-foreground">
                    {article.length} characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
