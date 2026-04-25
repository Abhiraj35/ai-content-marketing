"use client";

import { Show } from "@clerk/nextjs";
import { HeroSection } from "@/components/blocks/hero-section";
import { Header } from "@/components/header";
import Content from "@/components/content";

export default function DashboardHomePage() {
  return (
    <div className="min-h-screen">
      <Show when="signed-out">
        <HeroSection />
      </Show>

      <Show when="signed-in">
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Content />
        </div>
      </Show>
    </div>
  );
}
