import { NavLink } from "react-router-dom";
import {
  Scale,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react";

const navItems = [
  { to: "/", label: "工作台", icon: LayoutDashboard },
  { to: "/clients", label: "客户管理", icon: Users },
  { to: "/cases", label: "案件管理", icon: Briefcase },
  { to: "/documents", label: "文书管理", icon: FileText },
  { to: "/schedule", label: "日程管理", icon: Calendar },
  { to: "/statistics", label: "数据统计", icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-navy-500 flex flex-col z-40">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-navy-400/30">
        <Scale className="w-7 h-7 text-gold-500" />
        <span className="font-serif text-xl font-semibold text-gold-500">
          律信通
        </span>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-200",
                isActive
                  ? "bg-navy-400/50 text-gold-500 border-l-2 border-gold-500"
                  : "text-navy-200 hover:bg-navy-400/30 hover:text-white border-l-2 border-transparent",
              ].join(" ")
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-navy-400/30">
        <p className="text-xs text-navy-300/50">© 2026 律信通</p>
      </div>
    </aside>
  );
}
