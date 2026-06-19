import { ReactNode } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-60 min-h-screen bg-ivory-100 p-8">
        {children}
      </main>
    </div>
  );
}
