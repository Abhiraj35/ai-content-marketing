"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncateText } from "@/lib/utils";
import { Sprout, Plus, Loader2, AlertCircle, FileText, Share2, Mail, Globe, ArrowRight, Sparkles } from "lucide-react";
import LandingPage from "./components/LandingPage";

export default function Home() {
  const projects = useQuery(api.contentProjects.getUserProjects);

  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Signed Out State - Landing Page */}
      <Show when="signed-out">
        <LandingPage />
      </Show>

      {/* Signed In State - Projects Dashboard */}
      <Show when="signed-in">
        <div className="min-h-screen bg-[#FFFBEB]">
          {/* Header */}
          <header className="sticky top-0 z-40 glass border-b border-[#E7E5E4]/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <span 
                  className="text-xl font-bold text-[#431407]" 
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Sprout
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/create">
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-soft"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Content
                  </Button>
                </Link>
                <UserButton />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Banner */}
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h1 
                  className="text-2xl font-bold text-[#431407]"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Welcome back!
                </h1>
              </div>
              <p className="text-[#78716C]">
                Ready to grow your content ecosystem? Start with a new topic or check your existing projects.
              </p>
            </div>

            {/* Projects Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#431407] mb-2">Your Content Garden</h2>
              <p className="text-sm text-[#78716C]">
                Manage and publish your AI-generated content
              </p>
            </div>

            {projects === undefined ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : projects.length === 0 ? (
              /* Empty State */
              <Card className="bg-white border-[#E7E5E4] shadow-soft">
                <CardContent className="pt-12 pb-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6">
                    <Sprout className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 
                    className="text-xl font-bold text-[#431407] mb-2"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Your garden is empty
                  </h3>
                  <p className="text-[#78716C] mb-6 max-w-md mx-auto">
                    Plant your first content seed and watch it grow into a thriving ecosystem of blog posts, 
                    social media, and newsletters.
                  </p>
                  <Link href="/create">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-soft-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Content
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              /* Projects Grid */
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project._id} href={`/dashboard/${project._id}`}>
                    <Card className="bg-white border-[#E7E5E4] shadow-soft card-lift cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 pr-4">
                            <h3 className="font-bold text-[#431407] line-clamp-2 mb-1">
                              {project.blogPost?.title || truncateText(project.inputContent, 50)}
                            </h3>
                            <p className="text-sm text-[#78716C]">
                              {formatDate(project.createdAt)}
                            </p>
                          </div>
                          <StatusBadge status={project.status} />
                        </div>

                        <p className="text-sm text-[#78716C] line-clamp-2 mb-4">
                          {project.blogPost?.excerpt || `Input: ${truncateText(project.inputContent, 100)}`}
                        </p>

                        {/* Content Types Preview */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.blogPost && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span className="text-xs text-amber-700">Blog</span>
                            </div>
                          )}
                          {project.socialPosts && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-teal-50 rounded-lg">
                              <Share2 className="w-3 h-3 text-teal-600" />
                              <span className="text-xs text-teal-700">Social</span>
                            </div>
                          )}
                          {project.emailNewsletter && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg">
                              <Mail className="w-3 h-3 text-orange-600" />
                              <span className="text-xs text-orange-700">Email</span>
                            </div>
                          )}
                          {project.seoMetadata && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-lg">
                              <Globe className="w-3 h-3 text-purple-600" />
                              <span className="text-xs text-purple-700">SEO</span>
                            </div>
                          )}
                        </div>

                        {/* Published Platforms */}
                        {project.publishedTo && project.publishedTo.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#E7E5E4]">
                            <p className="text-xs text-[#78716C] mb-2">Published to:</p>
                            <div className="flex flex-wrap gap-1">
                              {project.publishedTo.map((platform) => (
                                <Badge 
                                  key={platform} 
                                  variant="secondary"
                                  className="bg-teal-50 text-teal-700 border-teal-200"
                                >
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </Show>
    </div>
  );
}

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
      icon: null,
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const { bg, text, icon } = config[status] || config.draft;

  return (
    <Badge className={`${bg} ${text} border-0 shrink-0`}>
      <span className="flex items-center gap-1">
        {icon}
        <span className="capitalize">{status}</span>
      </span>
    </Badge>
  );
}
