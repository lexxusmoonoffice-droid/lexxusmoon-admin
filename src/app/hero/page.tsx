"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import AdminLayout from "@/components/AdminLayout";
import ImageUploader from "@/components/ImageUploader";

interface HeroSection {
  _id: string;
  images: string[];
  mobileImages?: string[];
  intervalMs: number;
  mobileIntervalMs?: number;
  isActive: boolean;
}

function HeroAdminPageContent() {
  const router = useRouter();
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newMobileImageUrl, setNewMobileImageUrl] = useState("");
  const [intervalMs, setIntervalMs] = useState(5000);
  const [mobileIntervalMs, setMobileIntervalMs] = useState(5000);
  const [activeTab, setActiveTab] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const fetchHeroSection = async () => {
    try {
      setLoading(true);
      const response = await api.get("/hero");
      setHeroSection(response.data);
      setImages(response.data.images);
      setMobileImages(response.data.mobileImages || []);
      setIntervalMs(response.data.intervalMs);
      setMobileIntervalMs(response.data.mobileIntervalMs || response.data.intervalMs);
      setError("");
    } catch (err) {
      setError("Failed to fetch hero section data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addImageByUrl = async (url: string, isMobile: boolean = false) => {
    if (!url.trim()) {
      setError("Please enter an image URL");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const imageType = isMobile ? "mobileImages" : "images";
      await api.post("/hero/add-images", { [imageType]: [url] });

      if (isMobile) {
        setMobileImages((prev) => [...prev, url]);
        setNewMobileImageUrl("");
      } else {
        setImages((prev) => [...prev, url]);
        setNewImageUrl("");
      }
      setSuccess(`${isMobile ? "Mobile" : "Desktop"} image added successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add image");
    }
  };

  const handleAddImage = (isMobile: boolean = false) =>
    addImageByUrl(isMobile ? newMobileImageUrl : newImageUrl, isMobile);

  const handleRemoveImage = async (imageUrl: string, isMobile: boolean = false) => {
    try {
      setError("");
      setSuccess("");
      const imageType = isMobile ? "mobileImages" : "images";
      await api.post("/hero/remove-image", { imageUrl, imageType });

      if (isMobile) {
        setMobileImages(mobileImages.filter((img) => img !== imageUrl));
      } else {
        setImages(images.filter((img) => img !== imageUrl));
      }
      setSuccess(`${isMobile ? "Mobile" : "Desktop"} image removed successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove image");
    }
  };

  const handleUpdateInterval = async () => {
    try {
      setError("");
      setSuccess("");
      await api.put("/hero", {
        images,
        mobileImages,
        intervalMs,
        mobileIntervalMs
      });
      setSuccess("Settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update settings");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: "#E02222" }}>Hero Section Management</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("desktop")}
          style={{
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: activeTab === "desktop" ? 700 : 500,
            color: activeTab === "desktop" ? "#E02222" : "#6b7280",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "desktop" ? "3px solid #E02222" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-2px",
          }}
        >
          🖥️ Desktop
        </button>
        <button
          onClick={() => setActiveTab("mobile")}
          style={{
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: activeTab === "mobile" ? 700 : 500,
            color: activeTab === "mobile" ? "#E02222" : "#6b7280",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: activeTab === "mobile" ? "3px solid #E02222" : "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "-2px",
          }}
        >
          📱 Mobile
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.5)", borderRadius: 8, color: "#ef4444" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.5)", borderRadius: 8, color: "#22c55e" }}>
          {success}
        </div>
      )}

      {/* Add Desktop Image Section */}
      {activeTab === "desktop" && (
        <div style={{ marginBottom: 28, padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#171200" }}>Add Desktop Image</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Enter image URL (e.g., /web/1.jpg or https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddImage(false)}
              style={{
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                color: "#171200",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E02222";
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(224,34,34,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => handleAddImage(false)}
              style={{
                padding: "12px 20px",
                backgroundColor: "#E02222",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#cc1f1f";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(224,34,34,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E02222";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Add Desktop Image
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            </div>
            <ImageUploader onUploaded={(url) => addImageByUrl(url, false)} />
          </div>
        </div>
      )}

      {/* Add Mobile Image Section */}
      {activeTab === "mobile" && (
        <div style={{ marginBottom: 28, padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#171200" }}>Add Mobile Image</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>These images will be displayed on mobile devices (screens &lt; 768px)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="Enter image URL (optimized for mobile)"
              value={newMobileImageUrl}
              onChange={(e) => setNewMobileImageUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddImage(true)}
              style={{
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                color: "#171200",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E02222";
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(224,34,34,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => handleAddImage(true)}
              style={{
                padding: "12px 20px",
                backgroundColor: "#E02222",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#cc1f1f";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(224,34,34,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E02222";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Add Mobile Image
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            </div>
            <ImageUploader onUploaded={(url) => addImageByUrl(url, true)} />
          </div>
        </div>
      )}

      {/* Interval Control Section */}
      <div style={{ marginBottom: 28, padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#171200" }}>Carousel Interval</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#4b5563" }}>🖥️ Desktop Interval (milliseconds)</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                color: "#171200",
                transition: "all 0.2s ease",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E02222";
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(224,34,34,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#4b5563" }}>📱 Mobile Interval (milliseconds)</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={mobileIntervalMs}
              onChange={(e) => setMobileIntervalMs(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 14,
                color: "#171200",
                transition: "all 0.2s ease",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#E02222";
                e.currentTarget.style.backgroundColor = "#ffffff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(224,34,34,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            onClick={handleUpdateInterval}
            style={{
              padding: "12px 20px",
              backgroundColor: "#E02222",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#cc1f1f";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(224,34,34,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#E02222";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Update Settings
          </button>
        </div>
      </div>

      {/* Desktop Images Section */}
      {activeTab === "desktop" && (
      <div style={{ padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#171200" }}>Desktop Images ({images.length})</h2>

        {images.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>No desktop images yet. Add some to get started!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {images.map((img, idx) => {
              const imageUrl = img.startsWith("http") ? img : `http://localhost:3000${img}`;
              return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "relative", width: "100%", height: 200, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                  <img
                    src={imageUrl}
                    alt={`Hero image ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0, wordBreak: "break-word", maxHeight: 60, overflow: "hidden" }}>{img}</p>
                  <button
                    onClick={() => handleRemoveImage(img, false)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "1px solid rgba(239,68,68,0.3)",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                      e.currentTarget.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
      )}

      {/* Mobile Images Section */}
      {activeTab === "mobile" && (
      <div style={{ padding: 24, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#171200" }}>Mobile Images ({mobileImages.length})</h2>

        {mobileImages.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 14 }}>No mobile images yet. {images.length > 0 ? "Desktop images will be used on mobile devices." : "Add some to get started!"}</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {mobileImages.map((img, idx) => {
              const imageUrl = img.startsWith("http") ? img : `http://localhost:3000${img}`;
              return (
              <div
                key={idx}
                style={{
                  position: "relative",
                  backgroundColor: "#f9fafb",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ position: "relative", width: "100%", height: 160, backgroundColor: "#e5e7eb", overflow: "hidden" }}>
                  <img
                    src={imageUrl}
                    alt={`Mobile hero image ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0, wordBreak: "break-word", maxHeight: 60, overflow: "hidden" }}>{img}</p>
                  <button
                    onClick={() => handleRemoveImage(img, true)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "1px solid rgba(239,68,68,0.3)",
                      cursor: "pointer",
                      fontSize: 13,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.2)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)";
                      e.currentTarget.style.color = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)";
                      e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default function HeroAdminPage() {
  return (
    <AdminLayout>
      <HeroAdminPageContent />
    </AdminLayout>
  );
}
