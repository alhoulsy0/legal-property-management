"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGlobal, HearingData, LegalFinancialData } from "../../GlobalProvider";
import { 
  uploadCaseDocument, 
  listCaseDocuments, 
  getDocumentUrl, 
  deleteCaseDocument, 
  VaultFile, 
  DocumentCategory 
} from "@/lib/document_vault";
import { 
  Scale, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Plus, 
  FileText, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  FileUp, 
  X, 
  Clock, 
  Trash2, 
  Download, 
  Loader2 
} from "lucide-react";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const { 
    clients, 
    cases, setCases,
    wakalas, 
    hearings, setHearings, 
    legalFinancials, setLegalFinancials 
  } = useGlobal();

  // Find the current case
  const currentCase = cases.find(c => c.id === caseId);
  const client = currentCase ? clients.find(cl => cl.id === currentCase.clientId) : null;
  const activeWakala = currentCase ? wakalas.find(w => w.clientId === currentCase.clientId && w.status === "Active") : null;

  // Filter hearings and financials for this case
  const caseHearings = hearings
    .filter(h => h.caseId === caseId)
    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

  const caseFinancials = legalFinancials
    .filter(f => f.caseId === caseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPaid = caseFinancials.reduce((sum, f) => sum + f.amount, 0);

  // Document Vault State
  const [vaultCategory, setVaultCategory] = useState<DocumentCategory>("pleadings");
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [vaultError, setVaultError] = useState("");

  // Modal State for Hearing Input Modal (ضبط الجلسة)
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Form States - Hearing (ضبط الجلسة)
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [judicialPanel, setJudicialPanel] = useState("");
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [requiredActions, setRequiredActions] = useState("");
  const [minuteFileName, setMinuteFileName] = useState("");

  // Form States - Expense
  const [expenseType, setExpenseType] = useState<LegalFinancialData["type"]>("رسوم محاكم");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);

  // Load documents from storage bucket based on active category
  const loadVaultFiles = async () => {
    if (currentCase) {
      const files = await listCaseDocuments(currentCase.clientId, currentCase.id, vaultCategory);
      setVaultFiles(files);
    }
  };

  useEffect(() => {
    loadVaultFiles();
  }, [vaultCategory, currentCase]);

  if (!currentCase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h2 className="text-2xl font-extrabold text-slate-900">ملف القضية غير موجود</h2>
        <p className="text-slate-500 font-semibold text-sm">عذراً، لم نتمكن من العثور على القضية المطلوبة.</p>
        <button 
          onClick={() => router.push("/cases")}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 font-bold text-sm shadow-md flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة لسجل القضايا</span>
        </button>
      </div>
    );
  }

  // Handle Recording outcome of court session (ضبط الجلسة)
  const handleHearingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionDate || !notes) return;

    const newHearing: HearingData = {
      id: `h-${Date.now()}`,
      caseId,
      sessionDate: new Date(sessionDate).toISOString(),
      judicialPanel,
      notes: notes + (minuteFileName ? ` [مستند مرفق: ${minuteFileName}]` : ""),
      nextSessionDate: nextSessionDate ? new Date(nextSessionDate).toISOString() : undefined,
      requiredActions
    };

    setHearings([...hearings, newHearing]);
    setShowHearingModal(false);

    // Reset Form
    setSessionDate("");
    setNotes("");
    setJudicialPanel("");
    setNextSessionDate("");
    setRequiredActions("");
    setMinuteFileName("");
  };

  // Handle Add Expense
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;

    const newExpense: LegalFinancialData = {
      id: `f-${Date.now()}`,
      caseId,
      type: expenseType,
      amount: Number(expenseAmount),
      date: expenseDate
    };

    setLegalFinancials([...legalFinancials, newExpense]);
    setShowExpenseModal(false);
    setExpenseAmount("");
  };

  // Document Vault Upload Handler
  const handleVaultUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentCase) return;

    setIsUploading(true);
    setVaultError("");

    const res = await uploadCaseDocument(currentCase.clientId, currentCase.id, vaultCategory, file);
    setIsUploading(false);

    if (res.success) {
      loadVaultFiles();
    } else {
      setVaultError(res.error || "فشل رفع الملف إلى المستودع.");
    }
  };

  // Document Vault Download / View Link Generator
  const handleDownloadFile = async (path: string, fileName: string) => {
    const url = await getDocumentUrl(path);
    if (url !== "#") {
      window.open(url, "_blank");
    } else {
      // Mock File Download trigger for local fallback demo
      const blob = new Blob(["محتوى ملف قانوني تجريبي"], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  };

  // Document Vault Delete Handler
  const handleDeleteFile = async (path: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المستند؟");
    if (!confirmed) return;

    const success = await deleteCaseDocument(path);
    if (success) {
      loadVaultFiles();
    } else {
      alert("فشل حذف الملف.");
    }
  };

  // Helper to get human-readable file sizes
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "غير معروف";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right">
      
      {/* Back button & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/cases")}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors bg-white border border-slate-200 shadow-sm"
          >
            <ArrowRight className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">تفاصيل ملف الدعوى رقم: {currentCase.caseNumber} / {currentCase.year}</h1>
            <p className="text-slate-500 mt-1 text-sm font-semibold">محكمة {currentCase.courtName} - دعوى {currentCase.caseType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHearingModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>ضبط الجلسة الجديدة</span>
          </button>
        </div>
      </div>

      {/* Top Section Case Quick Info */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border-l border-slate-100 pl-4">
          <span className="text-slate-500 block text-xs font-bold mb-1">الموكل المدعي/المدعى عليه:</span>
          <span className="text-slate-955 font-extrabold text-base block">{client?.name || "غير معروف"}</span>
          <span className="text-slate-500 text-xs mt-1 block">الرقم الوطني: {client?.nationalId || "غير متوفر"}</span>
        </div>
        <div className="border-l border-slate-100 pl-4">
          <span className="text-slate-500 block text-xs font-bold mb-1">حالة الدعوى القضائية:</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold ${
              currentCase.status === "مفتوحة" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
            }`}>
              {currentCase.status}
            </span>
          </div>
        </div>
        <div className="border-l border-slate-100 pl-4">
          <span className="text-slate-500 block text-xs font-bold mb-1">الوكالة العدلية المعمول بها:</span>
          {activeWakala ? (
            <div className="mt-0.5">
              <span className="text-emerald-700 font-extrabold text-sm block">{activeWakala.wakalaNumber} ({activeWakala.type})</span>
              <span className="text-slate-500 text-xs block">كاتب عدل: {activeWakala.notaryPublicName}</span>
            </div>
          ) : (
            <span className="text-rose-600 font-bold text-xs flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> لا توجد وكالة عدلية فعالة مسجلة
            </span>
          )}
        </div>
        <div>
          <span className="text-slate-500 block text-xs font-bold mb-1">المهلة القانونية للاستئناف:</span>
          <span className="text-slate-900 font-black block mt-0.5 text-base">
            {currentCase.appeal_deadline ? currentCase.appeal_deadline : "لم يتم تحديد قرار بعد"}
          </span>
          {currentCase.judgment_date && (
            <span className="text-slate-500 text-xs block mt-1">تاريخ صدور الحكم: {currentCase.judgment_date}</span>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column Chronological hearings timeline (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span>الجدول الزمني لجلسات المحاكمة</span>
          </h3>

          {caseHearings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Clock className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-bold italic">لم يتم تسجيل أي جلسة قضائية لهذه الدعوى.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {caseHearings.map((h, i) => (
                <div key={h.id} className="relative pr-8 pb-6 last:pb-0">
                  {/* Timeline bar */}
                  {i !== caseHearings.length - 1 && (
                    <div className="absolute right-[9px] top-6 bottom-0 w-[2px] bg-slate-100"></div>
                  )}
                  <div className="absolute right-0 top-1.5 w-5 h-5 rounded-full border-4 border-slate-900 bg-white"></div>
                  
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-black text-slate-900 bg-slate-200/70 px-3 py-1 rounded-md">
                        الجلسة: {new Date(h.sessionDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {h.judicialPanel && (
                        <span className="text-xs text-slate-500 font-bold">الهيئة القضائية: {h.judicialPanel}</span>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-slate-400 text-xs font-bold block mb-1">وقائع وضبط الجلسة:</span>
                      <p className="text-sm text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">{h.notes}</p>
                    </div>

                    {(h.nextSessionDate || h.requiredActions) && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                        {h.nextSessionDate && (
                          <div>
                            <span className="text-slate-400 block mb-0.5">تاريخ الجلسة القادمة المندوب:</span>
                            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md block w-fit">
                              {new Date(h.nextSessionDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                        {h.requiredActions && (
                          <div>
                            <span className="text-slate-400 block mb-0.5">الإجراء المطلـوب تقديمه:</span>
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md block w-fit whitespace-pre-wrap">
                              {h.requiredActions}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column Financial summary & Document Vault widgets (1/3 width) */}
        <div className="space-y-6">
          
          {/* Financial summary widget */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <span>الذمة المالية والمصاريف</span>
              </h3>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                تسجيل مصروف
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-500">إجمالي النفقات القضائية والرسوم المسددة</span>
                <p className="text-2xl font-black text-rose-600 mt-1">د.أ {totalPaid.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">تفاصيل الرسوم والمصاريف القضائية</h4>
              
              {caseFinancials.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">لا توجد مصاريف مالية مقيدة.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pl-1">
                  {caseFinancials.map(f => (
                    <div key={f.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{f.type}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{f.date}</span>
                      </div>
                      <span className="text-xs font-black text-rose-600">د.أ {f.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DOCUMENT VAULT WIDGET */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>مستودع وثائق القضية (Document Vault)</span>
            </h3>

            {/* Document category selector tab-bar */}
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
              {[
                { id: "pleadings", label: "لوائح" },
                { id: "evidence", label: "بينات" },
                { id: "minutes", label: "محاضر" },
                { id: "judgments", label: "أحكام" },
                { id: "wakala", label: "وكالات" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setVaultCategory(cat.id as DocumentCategory)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all ${
                    vaultCategory === cat.id 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {vaultError && (
              <p className="text-[10px] font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">{vaultError}</p>
            )}

            {/* Document Listing */}
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {vaultFiles.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">لا توجد مستندات مرفوعة في هذا التصنيف.</p>
              ) : (
                vaultFiles.map(file => (
                  <div key={file.path} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="min-w-0 flex-1 pl-2">
                      <span className="font-bold text-slate-800 block truncate" title={file.name}>{file.name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{formatBytes(file.size)}</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(file.path, file.name)}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="تحميل / عرض"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.path)}
                        className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Upload form trigger box */}
            <div className="pt-2 border-t border-slate-100">
              <label className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-xs font-bold text-slate-700">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span>جاري رفع الملف...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4 text-slate-500" />
                    <span>رفع مستند إلى تصنيف {vaultCategory === "wakala" ? "الوكالات" : vaultCategory === "pleadings" ? "اللوائح" : vaultCategory === "evidence" ? "البينات" : vaultCategory === "minutes" ? "المحاضر" : "الأحكام"}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleVaultUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Connected Wakala summary card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>معلومات التوكيل والتمثيل</span>
            </h3>
            {activeWakala ? (
              <div className="space-y-2 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">رقم الوكالة:</span>
                  <span className="text-slate-900 font-extrabold">{activeWakala.wakalaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">نوع التمثيل:</span>
                  <span className="text-slate-900">{activeWakala.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">مصدقة لدى:</span>
                  <span className="text-slate-900">{activeWakala.notaryPublicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">تاريخ الإصدار:</span>
                  <span className="text-slate-900">{activeWakala.issueDate}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
                الرجاء تسجيل وكالة سارية المفعول للموكل للتمثيل القانوني أمام المحكمة.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* HEARING INPUT MODAL (ضبط الجلسة)           */}
      {/* ========================================== */}
      {showHearingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col p-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <span>ضبط الجلسة والمحضر القضائي</span>
              </h3>
              <button 
                onClick={() => { setShowHearingModal(false); setMinuteFileName(""); }} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHearingSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-700 mb-1">تاريخ الجلسة الحالية</label>
                  <input 
                    type="datetime-local" 
                    value={sessionDate} 
                    onChange={e => setSessionDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-700 mb-1">الهيئة القضائية المنظورة</label>
                  <input 
                    type="text" 
                    placeholder="مثال: القاضي أحمد الفايز" 
                    value={judicialPanel} 
                    onChange={e => setJudicialPanel(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 mb-1">وقائع وضبط الجلسة (مذكرات القاضي)</label>
                <textarea 
                  rows={4} 
                  placeholder="ملاحظات المحكمة، البينات، الاستجوابات..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 mb-1">رفع مستند الضبط القضائي (إرفاق ملف)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-slate-400 transition-colors cursor-pointer relative bg-slate-50">
                  <div className="space-y-1 text-center">
                    <FileUp className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600">
                      <span className="relative rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none">اختر ملفاً من جهازك</span>
                    </div>
                    <p className="text-[10px] text-slate-500">PDF, JPG up to 10MB</p>
                    {minuteFileName && <p className="text-xs text-emerald-600 font-extrabold mt-2">المستند المحدد: {minuteFileName}</p>}
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => setMinuteFileName(e.target.files?.[0]?.name || "")} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-700 mb-1">تاريخ الجلسة القادمة المندوب</label>
                  <input 
                    type="datetime-local" 
                    value={nextSessionDate} 
                    onChange={e => setNextSessionDate(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-700 mb-1">الإجراءات والقرارات المطلوبة للتقديم</label>
                  <input 
                    type="text" 
                    placeholder="مثال: دفع أتعاب الخبرة، تقديم شاهد..." 
                    value={requiredActions} 
                    onChange={e => setRequiredActions(e.target.value)} 
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowHearingModal(false); setMinuteFileName(""); }}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-sm"
                >
                  تأكيد الحفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* EXPENSE REGISTRATION MODAL                 */}
      {/* ========================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm flex flex-col p-6">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-700" />
                <span>تسجيل مصروف للقضية</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] text-slate-700 mb-1">نوع المصروف</label>
                <select 
                  value={expenseType} 
                  onChange={e => setExpenseType(e.target.value as any)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value="رسوم محاكم">رسوم محاكم</option>
                  <option value="أتعاب محاماة">أتعاب محاماة</option>
                  <option value="أتعاب خبرة">أتعاب خبرة</option>
                  <option value="طوابع">طوابع</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 mb-1">التاريخ</label>
                <input 
                  type="date" 
                  value={expenseDate} 
                  onChange={e => setExpenseDate(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-950" 
                  required 
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-700 mb-1">المبلغ (د.أ)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={expenseAmount} 
                  onChange={e => setExpenseAmount(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                  required 
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-sm"
                >
                  حفظ المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
