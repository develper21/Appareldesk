import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar width changes
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarCollapsed(width < 100);
      }
    };

    // Use MutationObserver to detect style changes
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const observer = new MutationObserver(handleResize);
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div 
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <DashboardHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
