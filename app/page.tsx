"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncateText } from "@/lib/utils";
import { FileText, Plus, Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const projects = useQuery(api.contentProjects.getUserProjects);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">AI Content Marketing</h1>
          </div>
          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Content
                </Button>
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Show when="signed-out">
          <div className="max-w-2xl mx-auto text-center py-20">
            <h2 className="text-4xl font-bold mb-4">
              AI-Powered Content Marketing
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Generate blog posts, social media content, and email newsletters
              from a single topic or article. All powered by AI.
            </p>
            <SignInButton>
              <Button size="lg">Get Started</Button>
            </SignInButton>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Your Content Projects</h2>
            <p className="text-muted-foreground">
              Manage and publish your AI-generated content
            </p>
          </div>

          {projects === undefined ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  No content projects yet. Create your first one!
                </p>
                <Link href="/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Content
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project._id} href={`/dashboard/${project._id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">
                          {project.blogPost?.title ||
                            truncateText(project.inputContent, 50)}
                        </CardTitle>
                        <StatusBadge status={project.status} />
                      </div>
                      <CardDescription>
                        {formatDate(project.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.blogPost?.excerpt ||
                          `Input: ${truncateText(project.inputContent, 100)}`}
                      </p>
                      {project.publishedTo &&
                        project.publishedTo.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.publishedTo.map((platform) => (
                              <Badge key={platform} variant="secondary">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </Show>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "secondary",
    generating: "default",
    completed: "default",
    failed: "destructive",
  };

  return (
    <Badge variant={variants[status] || "outline"}>
      {status === "generating" && (
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      )}
      {status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
