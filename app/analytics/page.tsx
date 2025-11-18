"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveAnalytics } from "@/lib/analyticsTransfer";
import DescriptiveTab from "./components/DescriptiveTab";
import PredictiveTab from "./components/PredictiveTab";
import PrescriptiveTab from "./components/PrescriptiveTab";
import { ChevronLeft, BarChart, TrendingUp, Zap, LucideIcon } from "lucide-react";

type ActiveTab = "descriptive" | "predictive" | "prescriptive";

// Define an interface for the TabButton props
interface TabButtonProps {
    activeTab: ActiveTab;
    tab: ActiveTab;
    label: string;
    colorClass: string;
    icon: LucideIcon; // Type for Lucide icons
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("descriptive"); // Using the defined type
  const router = useRouter();

  useEffect(() => {
    if (liveAnalytics.length) {
      setAnalytics(JSON.parse(JSON.stringify(liveAnalytics)));
    } else {
      fetch("/api/analytics")
        .then((r) => r.json())
        .then((j) => setAnalytics(j.analytics || []))
        .catch(console.error);
    }
  }, []);
  
  const TabButton: React.FC<TabButtonProps> = ({ activeTab, tab, label, colorClass, icon: Icon }) => {
    const isActive = activeTab === tab; 
    
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
          isActive
            ? `${colorClass} text-white transform scale-105 shadow-xl`
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <div className="container mx-auto px-6 lg:px-10 py-12">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-8 border-b border-gray-800 mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            <span className="text-cyan-400">Analytics</span> Dashboard
          </h1>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-lg text-sm text-gray-300 font-semibold transition-all duration-300 border border-gray-700 hover:border-cyan-600"
          >
            <ChevronLeft className="w-5 h-5"/> Back to Home
          </button>
        </div>

        {/* Tab Buttons - Now passing the activeTab prop */}
        <div className="sticky top-0 bg-gray-950 py-6 z-10 flex gap-5 justify-center">
          <TabButton
            activeTab={activeTab} // Passed prop
            tab="descriptive"
            label="Descriptive (What Happened?)"
            colorClass="bg-cyan-600 shadow-cyan-500/30"
            icon={BarChart}
          />
          <TabButton
            activeTab={activeTab} // Passed prop
            tab="predictive"
            label="Predictive (What Will Happen?)"
            colorClass="bg-emerald-600 shadow-emerald-500/30"
            icon={TrendingUp}
          />
          <TabButton
            activeTab={activeTab} // Passed prop
            tab="prescriptive"
            label="Prescriptive (What Should We Do?)"
            colorClass="bg-amber-600 shadow-amber-500/30"
            icon={Zap}
          />
        </div>

        {/* Tabs Content Area */}
        <div className="py-8">
            {activeTab === "descriptive" && <DescriptiveTab data={analytics} />}
            {activeTab === "predictive" && <PredictiveTab data={analytics} />}
            {activeTab === "prescriptive" && <PrescriptiveTab data={analytics} />}

            {/* Placeholder/Fallback */}
            {!analytics.length && (
                <div className="p-10 text-center bg-gray-800 rounded-xl mt-10">
                    <p className="text-xl text-gray-400">Loading analytics data...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}