"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { AppraisalResponse } from "@/types/appraisal";

type DeviceCategory =
  | "Smartphones & Tablets"
  | "Laptops & MacBooks"
  | "Desktop PCs & Monitors"
  | "Gaming Consoles (PlayStation, Xbox, Switch)"
  | "Audio Gear (Headphones, Bluetooth Speakers)"
  | "Smartwatches & Wearables"
  | "Cameras & Drones";

type SubmissionState = "idle" | "loading" | "success" | "error";

const initialCategory: DeviceCategory = "Smartphones & Tablets";

interface CountUpProps {
  endValue: number;
  duration?: number;
}

function CountUp({ endValue, duration = 1500 }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = endValue;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = 60;
    const stepTime = duration / totalSteps;
    const increment = (end - start) / totalSteps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start + increment * currentStep);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  const formattedCount = Number.isInteger(endValue)
    ? Math.round(count).toLocaleString()
    : count.toFixed(1);

  return <span>{formattedCount}</span>;
}

type Tab = "dashboard" | "history" | "analytics";

const PRESETS = [
  {
    label: "📱 Smashed iPhone Screen",
    category: "Smartphones & Tablets" as DeviceCategory,
    description: "iPhone 13 screen is completely shattered and unresponsive to touch. Rear glass is intact but front display is bleeding pixels.",
    fileName: "iphone-smashed.png",
  },
  {
    label: "💻 Dead Laptop Battery",
    category: "Laptops & MacBooks" as DeviceCategory,
    description: "MacBook Air battery is swollen. Trackpad is pushed up slightly and the laptop only boots when plugged into the charger.",
    fileName: "macbook-battery.png",
  },
  {
    label: "🔋 Water-Damaged Tablet",
    category: "Smartphones & Tablets" as DeviceCategory,
    description: "iPad was dropped in liquid. Screen flickers and the charging port does not recognize power input.",
    fileName: "ipad-water-damage.png",
  },
];

export default function DeviceUpload() {
  const [deviceCategory, setDeviceCategory] =
    useState<DeviceCategory>(initialCategory);
  const [issueDescription, setIssueDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [status, setStatus] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [appraisalResult, setAppraisalResult] = useState<AppraisalResponse | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [historyList, setHistoryList] = useState<AppraisalResponse[]>([]);

  function applyPreset(preset: typeof PRESETS[number]) {
    setDeviceCategory(preset.category);
    setIssueDescription(preset.description);
    const mockFile = new File(["mock_data"], preset.fileName, { type: "image/png" });
    setImageFile(mockFile);
    setPreviewUrl("");
  }

  function handleReset() {
    setDeviceCategory(initialCategory);
    setIssueDescription("");
    setImageFile(null);
    setPreviewUrl("");
    setStatus("idle");
    setErrorMessage("");
    setAppraisalResult(null);
  }

  function handleDownloadPDF() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const imageLabel = useMemo(() => {
    if (!imageFile) {
      return "Upload a device photo or model sticker";
    }

    return imageFile.name;
  }, [imageFile]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;

    setImageFile(nextFile);

    if (!nextFile) {
      setPreviewUrl("");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(typeof fileReader.result === "string" ? fileReader.result : "");
    };
    fileReader.readAsDataURL(nextFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("device_category", deviceCategory);
      formData.append("issue_description", issueDescription);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("http://localhost:4000/api/appraisal", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Unable to fetch the appraisal response.");
      }

      const payload = (await response.json()) as AppraisalResponse;
      setAppraisalResult(payload);
      setHistoryList((prev) => [payload, ...prev]);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected submission error.",
      );
    }
  }


  const latestAppraisal = appraisalResult || historyList[0];

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row gap-8 px-6 py-10 text-white md:px-10">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: #020617 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          section {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}} />
      {/* Sidebar Navigation */}
      <aside className="print:hidden w-full lg:w-64 shrink-0 flex flex-col space-y-3">
        <div className="flex items-center gap-3 px-3 py-4 border-b border-emerald-500/20">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center font-bold text-emerald-950 text-lg shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            BV
          </div>
          <div>
            <p className="font-bold text-white tracking-wide">ByteValue</p>
            <p className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase">Circular Diagnostics</p>
          </div>
        </div>

        <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-emerald-900/60 to-emerald-950/40 text-lime-300 border border-emerald-500/30 shadow-[0_4px_15px_rgba(4,47,31,0.4)]"
                : "text-slate-400 hover:text-emerald-100 hover:bg-emerald-950/20 border border-transparent"
            }`}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "history"
                ? "bg-gradient-to-r from-emerald-900/60 to-emerald-950/40 text-lime-300 border border-emerald-500/30 shadow-[0_4px_15px_rgba(4,47,31,0.4)]"
                : "text-slate-400 hover:text-emerald-100 hover:bg-emerald-950/20 border border-transparent"
            }`}
          >
            <span>📜</span> Appraisal History
            {historyList.length > 0 && (
              <span className="ml-auto bg-lime-400 text-emerald-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {historyList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-emerald-900/60 to-emerald-950/40 text-lime-300 border border-emerald-500/30 shadow-[0_4px_15px_rgba(4,47,31,0.4)]"
                : "text-slate-400 hover:text-emerald-100 hover:bg-emerald-950/20 border border-transparent"
            }`}
          >
            <span>🛡️</span> Fair-Price Analytics
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="print:hidden relative overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 p-8 shadow-[0_30px_90px_rgba(5,46,22,0.45)] md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(163,230,53,0.18),transparent_34%)]" />
                <div className="relative space-y-6">
                  <div className="space-y-4">
                    <span className="inline-flex rounded-full border border-emerald-300/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-100">
                      Fair-Price Shield
                    </span>
                    <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">
                      Turn broken electronics into transparent value and measurable impact.
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-emerald-50/82 md:text-base">
                      Start with a quick intake. Tell ByteValue what device you have,
                      describe the fault, and upload an image so the appraisal flow can
                      estimate salvage value and environmental benefit.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">
                        Intake Time
                      </p>
                      <p className="mt-3 text-2xl font-semibold">60 sec</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">
                        Routing Goal
                      </p>
                      <p className="mt-3 text-2xl font-semibold">Zero landfill</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-100/70">
                        Engine
                      </p>
                      <p className="mt-3 text-lg sm:text-xl font-semibold">Gemini Core (Live)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-emerald-200/10 bg-slate-950/90 p-6 shadow-[0_25px_80px_rgba(2,8,23,0.55)] backdrop-blur md:p-8">
                {status === "success" && appraisalResult ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-lime-300">
                        Appraisal Complete
                      </p>
                      <h2 className="text-2xl font-semibold text-white">
                        Appraisal Report
                      </h2>
                      <p className="text-sm leading-6 text-slate-300">
                        Our AI model has analyzed your device image and description to estimate salvage value and environmental metrics.
                      </p>
                    </div>

                    {/* Estimated Salvage Value Hero Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 p-5 shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.1),transparent_40%)]" />
                      <div className="relative space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/70">
                            Estimated Salvage Value
                          </p>
                          <p className="mt-1 text-4xl font-bold text-lime-300">
                            Rs. {appraisalResult.financial_valuation.fair_salvage_value}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-emerald-300/10 pt-4 text-xs">
                          <div>
                            <p className="text-slate-400">Detected Model</p>
                            <p className="font-semibold text-white mt-0.5">
                              {appraisalResult.device_details.detected_model}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Estimated Repair Cost</p>
                            <p className="font-semibold text-rose-300 mt-0.5">
                              Rs. {appraisalResult.financial_valuation.estimated_repair_cost}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Confidence Score</p>
                            <p className="font-semibold text-emerald-200 mt-0.5">
                              {Math.round(appraisalResult.device_details.confidence_score * 100)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400">Baseline Scrap Quote</p>
                            <p className="font-semibold text-slate-300 mt-0.5">
                              Rs. {appraisalResult.financial_valuation.predatory_scrap_quote_baseline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Comparison Progress Bar */}
                    <div className="rounded-2xl border border-emerald-300/10 bg-slate-900/60 p-5 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase tracking-[0.12em] text-emerald-300">Financial Comparison</span>
                        {appraisalResult.financial_valuation.fair_salvage_value - appraisalResult.financial_valuation.estimated_repair_cost > appraisalResult.financial_valuation.predatory_scrap_quote_baseline ? (
                          <span className="text-lime-300 font-bold">Repair & Save</span>
                        ) : (
                          <span className="text-rose-400 font-bold">Recycle / Scrap</span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {/* Baseline Scrap Quote Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Predatory Scrap Quote (Dealers)</span>
                            <span className="font-semibold text-rose-400">Rs. {appraisalResult.financial_valuation.predatory_scrap_quote_baseline}</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden">
                            <div 
                              className="h-full bg-rose-500/80 rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (appraisalResult.financial_valuation.predatory_scrap_quote_baseline / Math.max(1, appraisalResult.financial_valuation.estimated_repair_cost + appraisalResult.financial_valuation.predatory_scrap_quote_baseline)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Estimated Repair Cost Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>Estimated Repair Cost (Restore Value)</span>
                            <span className="font-semibold text-lime-300">Rs. {appraisalResult.financial_valuation.estimated_repair_cost}</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500/80 rounded-full transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (appraisalResult.financial_valuation.estimated_repair_cost / Math.max(1, appraisalResult.financial_valuation.estimated_repair_cost + appraisalResult.financial_valuation.predatory_scrap_quote_baseline)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                        💡 {appraisalResult.financial_valuation.summary_text}
                      </div>
                    </div>

                    {/* Environmental Impact Badges */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-lime-300">
                        Environmental Impact
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <p className="text-base font-bold text-white">
                            <CountUp endValue={appraisalResult.environmental_impact.co2_saved_kg} /> kg
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-1">
                            CO₂ Saved
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <p className="text-base font-bold text-white">
                            <CountUp endValue={appraisalResult.environmental_impact.heavy_metals_diverted_g} /> g
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-1">
                            Metals Saved
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                          <p className="text-base font-bold text-white">
                            <CountUp endValue={appraisalResult.environmental_impact.landfill_space_saved_cm3} /> cm³
                          </p>
                          <p className="text-[9px] uppercase tracking-[0.1em] text-slate-400 mt-1">
                            Landfill Saved
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Salvageable / Working Components */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Salvageable Parts
                      </p>
                      <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {appraisalResult.salvageable_components.map((component, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-emerald-300/10 bg-emerald-950/20 px-3.5 py-2.5 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-white">{component.component_name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Condition: {component.condition}</p>
                            </div>
                            <span className="font-bold text-lime-300">
                              Rs. {component.estimated_value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleDownloadPDF}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-3 text-sm font-semibold text-lime-300 hover:bg-emerald-950/60 transition shadow-inner print:hidden"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        Download Certified Appraisal PDF
                      </button>

                      <button
                        onClick={handleReset}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-lime-300 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 print:hidden"
                      >
                        Reset / Test Another Device
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 space-y-2">
                      <p className="text-sm font-medium uppercase tracking-[0.24em] text-lime-300">
                        AI Intake Engine
                      </p>
                      <h2 className="text-2xl font-semibold text-white">
                        Upload your damaged device
                      </h2>
                      <p className="text-sm leading-6 text-slate-300">
                        This screen handles the device intake and sends a POST request to the backend appraisal route.
                      </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-emerald-50"
                          htmlFor="device-category"
                        >
                          Device category
                        </label>
                        <select
                          id="device-category"
                          className="w-full rounded-2xl border border-emerald-400/20 bg-emerald-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-lime-300 focus:ring-2 focus:ring-lime-400/30"
                          value={deviceCategory}
                          onChange={(event) =>
                            setDeviceCategory(event.target.value as DeviceCategory)
                          }
                        >
                          <option value="Smartphones & Tablets">Smartphones & Tablets</option>
                          <option value="Laptops & MacBooks">Laptops & MacBooks</option>
                          <option value="Desktop PCs & Monitors">Desktop PCs & Monitors</option>
                          <option value="Gaming Consoles (PlayStation, Xbox, Switch)">Gaming Consoles (PlayStation, Xbox, Switch)</option>
                          <option value="Audio Gear (Headphones, Bluetooth Speakers)">Audio Gear (Headphones, Bluetooth Speakers)</option>
                          <option value="Smartwatches & Wearables">Smartwatches & Wearables</option>
                          <option value="Cameras & Drones">Cameras & Drones</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          className="text-sm font-medium text-emerald-50"
                          htmlFor="issue-description"
                        >
                          Problem description
                        </label>
                        <textarea
                          id="issue-description"
                          className="min-h-32 w-full rounded-2xl border border-emerald-400/20 bg-emerald-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-lime-300 focus:ring-2 focus:ring-lime-400/30"
                          placeholder="Example: Sparked at the charging port and no longer powers on."
                          required
                          value={issueDescription}
                          onChange={(event) => setIssueDescription(event.target.value)}
                        />
                      </div>

                      {/* Demo Presets Row */}
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Quick Demo Presets</p>
                        <div className="flex flex-wrap gap-2">
                          {PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => applyPreset(preset)}
                              className="rounded-full bg-slate-900/80 hover:bg-emerald-950 border border-white/5 hover:border-emerald-500/30 px-3 py-1.5 text-[11px] text-slate-300 hover:text-white transition-all font-medium"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-emerald-50" htmlFor="device-image">
                          Device image
                        </label>
                        <label
                          className="flex cursor-pointer flex-col gap-4 rounded-3xl border border-dashed border-emerald-300/25 bg-emerald-900/20 p-4 transition hover:border-lime-300/60 hover:bg-emerald-900/30"
                          htmlFor="device-image"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">{imageLabel}</p>
                              <p className="mt-1 text-xs text-slate-300">
                                JPG, PNG, or WEBP for the intake flow
                              </p>
                            </div>
                            <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold text-emerald-950">
                              Choose file
                            </span>
                          </div>

                          {previewUrl ? (
                            <div className="relative h-48 overflow-hidden rounded-2xl">
                              <Image
                                alt="Selected device preview"
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, 40vw"
                                src={previewUrl}
                                unoptimized
                              />
                            </div>
                          ) : imageFile ? (
                            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 text-sm text-lime-300 gap-2">
                              <span className="text-3xl">📷</span>
                              <p className="font-semibold">{imageFile.name} (Preset Loaded)</p>
                            </div>
                          ) : (
                            <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-sm text-slate-400">
                              Image preview appears here after upload
                            </div>
                          )}
                        </label>
                        <input
                          id="device-image"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          type="file"
                          onChange={handleImageChange}
                        />
                      </div>

                      <button
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-lime-300 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-lime-100"
                        disabled={status === "loading"}
                        type="submit"
                      >
                        {status === "loading" ? "Submitting appraisal..." : "Run appraisal"}
                      </button>

                      {status === "error" ? (
                        <div className="rounded-2xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
                          {errorMessage}
                        </div>
                      ) : null}
                    </form>
                  </>
                )}
              </div>
            </div>

            {status !== "success" && (
              <div className="mt-8 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-[2rem] border border-emerald-200/10 bg-slate-950/85 p-6 shadow-[0_25px_80px_rgba(2,8,23,0.45)]">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-lime-300">
                    Submission payload
                  </p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs leading-6 text-emerald-50/90">
                    {JSON.stringify(
                      {
                        device_category: deviceCategory,
                        issue_description: issueDescription,
                        image_name: imageFile?.name ?? null,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>

                <div className="rounded-[2rem] border border-emerald-200/10 bg-slate-950/85 p-6 shadow-[0_25px_80px_rgba(2,8,23,0.45)]">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-lime-300">
                    Live appraisal response
                  </p>
                  <div className="mt-4 rounded-2xl bg-slate-900 p-4">
                    {appraisalResult ? (
                      <div className="space-y-4 text-sm text-slate-200">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.2] text-emerald-200/70">
                              Detected model
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                              {appraisalResult.device_details.detected_model}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.2] text-emerald-200/70">
                              Fair salvage value
                            </p>
                            <p className="mt-2 text-lg font-semibold text-lime-300">
                              Rs. {appraisalResult.financial_valuation.fair_salvage_value}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                          {appraisalResult.salvageable_components.map((component) => (
                            <div
                              key={component.component_name}
                              className="rounded-2xl border border-emerald-300/10 bg-emerald-950/30 p-4"
                            >
                              <p className="font-medium text-white">{component.component_name}</p>
                              <p className="mt-2 text-sm text-lime-300">
                                Rs. {component.estimated_value}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">{component.condition}</p>
                            </div>
                          ))}
                        </div>

                        <pre className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-xs leading-6 text-emerald-50/90">
                          {JSON.stringify(appraisalResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
                        Submit the intake form to preview the backend response.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6 max-w-4xl">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white">Appraisal History</h2>
              <p className="text-sm text-slate-400">Scans recorded during this session.</p>
            </div>
            
            {historyList.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-emerald-300/20 bg-slate-950/40 p-12 text-center max-w-2xl mx-auto my-8">
                <p className="text-4xl mb-4">📜</p>
                <h3 className="text-xl font-bold text-white">No appraisal history yet</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Submit a device in the Dashboard tab. Our AI Engine will run circular diagnostics and compile historical items here.
                </p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-lime-300 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <div className="relative border-l border-emerald-500/20 pl-6 ml-3 space-y-8 py-2">
                {historyList.map((item, idx) => (
                  <div key={idx} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] mt-1.5 h-4.5 w-4.5 rounded-full border-2 border-emerald-500 bg-slate-950 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-lime-400" />
                    </div>
                    
                    <div className="rounded-3xl border border-emerald-300/10 bg-slate-950/80 p-6 shadow-lg hover:border-emerald-500/30 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-emerald-900/40 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                            {item.device_details.detected_model || "Detected Model"}
                          </span>
                          <h4 className="text-lg font-bold text-white mt-1">
                            {item.device_details.detected_model}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Reported Issue: {item.device_details.reported_issue}
                          </p>
                        </div>
                        <div className="text-right sm:border-l sm:border-white/5 sm:pl-6">
                          <p className="text-xs text-slate-400 uppercase tracking-wider">Salvage Value</p>
                          <p className="text-2xl font-bold text-lime-300 mt-0.5">
                            Rs. {item.financial_valuation.fair_salvage_value}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6 max-w-4xl">
            {latestAppraisal ? (
              <>
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-white">Fair-Price Analytics</h2>
                  <p className="text-sm text-slate-400">
                    Financial and structural breakdown for the latest scan: <span className="text-lime-300 font-semibold">{latestAppraisal.device_details.detected_model}</span>
                  </p>
                </div>

                {/* Financial Value Comparison */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Baseline Scrap Quote</p>
                    <p className="text-2xl font-bold text-rose-400 mt-2">Rs. {latestAppraisal.financial_valuation.predatory_scrap_quote_baseline}</p>
                    <p className="text-[10px] text-slate-500 mt-1.5">What predatory scrap dealers typically offer.</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5">
                    <p className="text-xs uppercase tracking-wider text-slate-400">Estimated Repair Cost</p>
                    <p className="text-2xl font-bold text-amber-300 mt-2">Rs. {latestAppraisal.financial_valuation.estimated_repair_cost}</p>
                    <p className="text-[10px] text-slate-500 mt-1.5">Average parts & labor cost to restore full utility.</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/30">
                    <p className="text-xs uppercase tracking-wider text-emerald-300">Fair Salvage Value</p>
                    <p className="text-2xl font-bold text-lime-300 mt-2">Rs. {latestAppraisal.financial_valuation.fair_salvage_value}</p>
                    <p className="text-[10px] text-emerald-500 mt-1.5">True value calculated by harvesting key modules.</p>
                  </div>
                </div>

                {/* Detailed Component Breakdown */}
                <div className="rounded-3xl border border-white/5 bg-slate-950/60 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">Module Harvest Valuation</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Component Name</th>
                          <th className="py-3 px-4">Condition Status</th>
                          <th className="py-3 px-4 text-right">Estimated Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestAppraisal.salvageable_components.map((component, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                            <td className="py-3 px-4 font-semibold text-white">{component.component_name}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex rounded-full bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                                {component.condition}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-lime-300 font-bold">Rs. {component.estimated_value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-emerald-300/20 bg-slate-950/40 p-12 text-center max-w-2xl mx-auto my-8">
                <p className="text-4xl mb-4">📊</p>
                <h3 className="text-xl font-bold text-white">No analytics data available</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Please submit a device in the Dashboard tab first. Once appraised, we will display an in-depth breakdown of replacement rates, parts valuations, and circular savings.
                </p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-lime-300 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-lime-200"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
