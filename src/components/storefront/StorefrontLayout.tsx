import { Outlet } from "react-router-dom";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";

export function StorefrontLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StorefrontHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
