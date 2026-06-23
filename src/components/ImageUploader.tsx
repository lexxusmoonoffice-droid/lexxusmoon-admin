"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";

interface LibraryImage {
  url: string;
  publicId: string;
}

interface ImageUploaderProps {
  onUploaded: (url: string) => void;
}

// Downscale an image in the browser before upload so the request stays well under
// Vercel's ~4.5MB serverless body limit (phone photos are often much larger).
function resizeImage(file: File, maxWidth = 1920): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file"));
    };
    img.src = objectUrl;
  });
}

export default function ImageUploader({ onUploaded }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState<LibraryImage[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (jpg, png, webp).");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const blob = await resizeImage(file);
      const baseName = (file.name.replace(/\.[^.]+$/, "") || "image").slice(0, 40);
      const form = new FormData();
      form.append("image", blob, `${baseName}.jpg`);
      const res = await api.post("/upload", form);
      if (res.data?.url) {
        onUploaded(res.data.url);
      } else {
        setError("Upload succeeded but no URL was returned.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLoadingLib(true);
    setError("");
    try {
      const res = await api.get("/upload/list");
      setLibrary(res.data?.images || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load library.");
    } finally {
      setLoadingLib(false);
    }
  };

  const pickFromLibrary = (url: string) => {
    onUploaded(url);
    setLibraryOpen(false);
  };

  const btn: React.CSSProperties = {
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    color: "#171200",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...btn, borderColor: "#E02222", color: "#E02222", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.7 : 1 }}
        >
          {uploading ? "Uploading..." : "⬆️ Upload from computer"}
        </button>
        <button type="button" onClick={openLibrary} disabled={uploading} style={btn}>
          🖼️ Choose from library
        </button>
      </div>

      {error && <p style={{ marginTop: 10, fontSize: 13, color: "#ef4444" }}>{error}</p>}

      {libraryOpen && (
        <div
          onClick={() => setLibraryOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 900,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#171200", margin: 0 }}>Image Library</h3>
              <button onClick={() => setLibraryOpen(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 20, overflowY: "auto" }}>
              {loadingLib ? (
                <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>
              ) : library.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 14 }}>No uploaded images yet. Use &quot;Upload from computer&quot; to add some.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
                  {library.map((img) => (
                    <button
                      key={img.publicId}
                      onClick={() => pickFromLibrary(img.url)}
                      style={{
                        padding: 0,
                        border: "2px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                        cursor: "pointer",
                        backgroundColor: "#f9fafb",
                        aspectRatio: "1 / 1",
                        transition: "border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#E02222")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="library" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
