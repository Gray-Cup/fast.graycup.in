"use client";

import { useState, useCallback, useRef } from "react";
import { PDFDocument } from "pdf-lib";

interface LabelFile {
  name: string;
  bytes: ArrayBuffer;
}

export default function LabelMergePage() {
  const [files, setFiles] = useState<LabelFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [merging, setMerging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (fileList: FileList) => {
    const pdfs: LabelFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type !== "application/pdf") continue;
      const bytes = await file.arrayBuffer();
      pdfs.push({ name: file.name, bytes });
    }
    setFiles((prev) => [...prev, ...pdfs]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));
  const clearAll = () => setFiles([]);

  const merge = async () => {
    if (files.length === 0) return;
    setMerging(true);

    try {
      // Collect all individual label pages from all uploaded PDFs
      const labelPages: { doc: PDFDocument; pageIdx: number }[] = [];

      for (const file of files) {
        const src = await PDFDocument.load(file.bytes);
        for (let i = 0; i < src.getPageCount(); i++) {
          labelPages.push({ doc: src, pageIdx: i });
        }
      }

      // A4 dimensions in points
      const A4_W = 595.28;
      const A4_H = 841.89;
      const margin = 14;
      const gap = 10;
      const cols = 2;
      const rows = 2;
      const perPage = cols * rows;
      const cellW = (A4_W - margin * 2 - gap * (cols - 1)) / cols;
      const cellH = (A4_H - margin * 2 - gap * (rows - 1)) / rows;

      const output = await PDFDocument.create();

      for (let i = 0; i < labelPages.length; i += perPage) {
        const batch = labelPages.slice(i, i + perPage);
        const page = output.addPage([A4_W, A4_H]);

        for (let j = 0; j < batch.length; j++) {
          const { doc: srcDoc, pageIdx } = batch[j];
          const [embedded] = await output.embedPages(
            (await PDFDocument.load(await srcDoc.save())).getPages().slice(pageIdx, pageIdx + 1)
          );

          const col = j % cols;
          const row = Math.floor(j / cols);
          const x = margin + col * (cellW + gap);
          // pdf-lib Y is from bottom — flip row
          const y = A4_H - margin - (row + 1) * cellH - row * gap;

          const srcPage = srcDoc.getPage(pageIdx);
          const srcW = srcPage.getWidth();
          const srcH = srcPage.getHeight();
          const scale = Math.min(cellW / srcW, cellH / srcH);
          const drawW = srcW * scale;
          const drawH = srcH * scale;
          const offsetX = (cellW - drawW) / 2;
          const offsetY = (cellH - drawH) / 2;

          page.drawPage(embedded, {
            x: x + offsetX,
            y: y + offsetY,
            width: drawW,
            height: drawH,
          });
        }
      }

      const pdfBytes = await output.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged-labels-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Merge failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setMerging(false);
    }
  };


  return (
    <div className="h-full overflow-y-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Label Merge</h1>
        <p className="text-sm text-gray-400 mt-1">Drop Delhivery shipping label PDFs — merged 4-per-page into a single A4 sheet, entirely in your browser.</p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          dragging ? "border-amber-400 bg-amber-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        <span className="text-3xl">📥</span>
        <p className="text-sm font-semibold text-gray-600">Drop PDFs here or click to browse</p>
        <p className="text-xs text-gray-400">Each PDF = one label. Multiple files supported.</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">{files.length} label{files.length !== 1 ? "s" : ""} · {Math.ceil(files.length / 4)} A4 page{Math.ceil(files.length / 4) !== 1 ? "s" : ""} output</span>
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Clear all</button>
          </div>
          <ul className="divide-y divide-gray-100">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700 truncate max-w-[80%]">{f.name}</span>
                <button
                  onClick={() => removeFile(i)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-4 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Merge button */}
      {files.length > 0 && (
        <button
          onClick={merge}
          disabled={merging}
          className="self-start bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black px-8 py-3 rounded-xl transition-colors cursor-pointer"
        >
          {merging ? "Merging…" : `Merge & Download (${files.length} labels → ${Math.ceil(files.length / 4)} page${Math.ceil(files.length / 4) !== 1 ? "s" : ""})`}
        </button>
      )}
    </div>
  );
}
