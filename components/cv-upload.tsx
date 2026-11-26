"use client";

import { useState } from "react";
import { MAX_CV_BYTES } from "@/lib/cv";

const ALLOWED = [".pdf", ".docx"];

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// A drag-and-drop style box around a real <input type="file">. The input is
// stretched invisibly over the whole box, so clicking, dragging a file onto it
// and the browser's "required" check all work natively.
export function CvUpload({ name = "cv", required = false }: { name?: string; required?: boolean }) {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const picked = input.files?.[0];
    setError(null);

    if (!picked) {
      setFile(null);
      return;
    }
    const lower = picked.name.toLowerCase();
    if (!ALLOWED.some((ext) => lower.endsWith(ext))) {
      input.value = "";
      setFile(null);
      setError("Please choose a PDF or DOCX file.");
      return;
    }
    if (picked.size > MAX_CV_BYTES) {
      input.value = "";
      setFile(null);
      setError("That file is over 4 MB. Please choose a smaller one.");
      return;
    }
    setFile({ name: picked.name, size: picked.size });
  }

  return (
    <div>
      <div
        className={`relative flex flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus-within:ring-2 focus-within:ring-teal-500 ${
          file
            ? "border-teal-400 bg-teal-50/60"
            : "border-navy-200 bg-navy-50/40 hover:border-teal-400 hover:bg-teal-50/40"
        }`}
      >
        <input
          id={name}
          name={name}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required={required}
          onChange={onChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
          <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
        </svg>
        {file ? (
          <>
            <span className="break-all text-sm font-semibold text-navy-900">{file.name}</span>
            <span className="text-xs text-teal-700">{formatSize(file.size)} · click to replace</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-navy-800">Click to upload or drag and drop</span>
            <span className="text-xs text-navy-500">PDF or DOCX, up to 4 MB</span>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}