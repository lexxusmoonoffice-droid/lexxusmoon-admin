"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Hero Section", href: "/hero", icon: "🎬" },
  { label: "Blogs", href: "/blogs", icon: "📝" },
  { label: "Comments", href: "/comments", icon: "💬" },
  { label: "Contacts", href: "/contacts", icon: "📩" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) { router.push("/login"); return; }
      try {
        await api.get("/auth/verify");
        setVerified(true);
      } catch {
        localStorage.removeItem("admin_token");
        router.push("/login");
      }
    };
    verifyToken();
  }, [router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/login");
  };

  if (!verified) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E02222", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div style={{ padding: "28px 24px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, backgroundColor: "#E02222", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>L</div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, lineHeight: 1 }}>Lexxusmoon</h2>
              <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0 0", lineHeight: 1 }}>Admin</p>
            </div>
          </div>
        </div>
        {!isDesktop && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>
      <nav style={{ flex: 1, paddingTop: 16, paddingBottom: 16 }}>
        {sidebarLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                margin: "4px 12px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "#a0a0a0",
                backgroundColor: isActive ? "#E02222" : "transparent",
                borderRadius: isActive ? 8 : 6,
                textDecoration: "none",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(224,34,34,0.15)";
                  e.currentTarget.style.color = "#d0d0d0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#a0a0a0";
                }
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{link.icon}</span>
              <span style={{ flex: 1 }}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "16px 12px", borderTop: "1px solid #1a1a1a" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            fontSize: 13,
            fontWeight: 500,
            color: "#a0a0a0",
            backgroundColor: "rgba(224,34,34,0.1)",
            border: "1px solid rgba(224,34,34,0.3)",
            cursor: "pointer",
            padding: "10px 16px",
            borderRadius: 6,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(224,34,34,0.2)";
            e.currentTarget.style.color = "#E02222";
            e.currentTarget.style.borderColor = "rgba(224,34,34,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(224,34,34,0.1)";
            e.currentTarget.style.color = "#a0a0a0";
            e.currentTarget.style.borderColor = "rgba(224,34,34,0.3)";
          }}
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", display: "flex" }}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside style={{
          width: 240,
          minWidth: 240,
          backgroundColor: "#0a0a0a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
          borderRight: "1px solid #1a1a1a",
          boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
        }}>
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Backdrop */}
      {!isDesktop && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }}
        />
      )}

      {/* Mobile Sidebar */}
      {!isDesktop && (
        <aside style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 260,
          backgroundColor: "#0a0a0a",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          zIndex: 50,
          transition: "transform 0.3s ease",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          borderRight: "1px solid #1a1a1a",
          boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
        }}>
          {sidebarContent}
        </aside>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, minHeight: "100vh", minWidth: 0, backgroundColor: "#f8f9fa" }}>
        {/* Mobile Top Bar */}
        {!isDesktop && (
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#171200",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#171200" }}>Lexxusmoon</span>
            <div style={{ width: 32 }} />
          </div>
        )}

        <div style={{ padding: isDesktop ? 40 : 16, maxWidth: isDesktop ? "100%" : "100%" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
