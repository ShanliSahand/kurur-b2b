"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Workflow from "@/components/Workflow";
import SearchBar from "@/components/SearchBar";
import ActionCards from "@/components/ActionCards";
import QuickLinks from "@/components/QuickLinks";

export default function Home() {
  // We add the state here so the SearchBar on the home page works
  const [activeTab, setActiveTab] = useState<"requests" | "ads" | "suppliers">("requests");

  return (
    <div>
      <Hero />
      <Workflow />
      
      {/* Pass the props to SearchBar */}
      <SearchBar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <ActionCards />
      <QuickLinks />
    </div>
  );
}