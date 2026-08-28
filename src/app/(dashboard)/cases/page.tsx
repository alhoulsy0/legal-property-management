"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobal, LegalCaseData, WakalaData, HearingData, LegalFinancialData } from "../GlobalProvider";
import { Scale, FileText, Calendar, DollarSign, Plus, Search, User, Clock, ArrowLeft, ArrowRight, AlertTriangle, ShieldCheck, Check, Trash2, X, Activity } from "lucide-react";

function CasesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { 
    clients, 
    cases, setCases, 
    wakalas, setWakalas, 
    hearings, setHearings, 
    legalFinancials, setLegalFinancials 
  } = useGlobal();

  // Active Tab state synced with URL parameter
  const [activeTab, setActiveTab] = useState<"cases" | "wakalas" | "agenda" | "financials">("cases");

  useEffect(() => {
    if (tabParam === "wakalas" || tabParam === "agenda" || tabParam === "financials" || tabParam === "cases") {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab("cases");
    }
  }, [tabParam]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals Toggle
  const [showAddCaseWizard, setShowAddCaseWizard] = useState(false);
  const [showAddWakalaModal, setShowAddWakalaModal] = useState(false);

  // ==========================================
  // WIZARD FORM STATES (Step-by-step case registration)
  // ==========================================
  const [wizardStep, setWizardStep] = useState(1);
  
  // Step 1: Client & Role selection
  const [wClientId, setWClientId] = useState<string>("");
  const [wClientRole, setWClientRole] = useState<"المدعي" | "المدعى عليه">("المدعي");

  // Step 2: Parties Information (Plaintiff & Defendant details)
  const [wPlaintiffName, setWPlaintiffName] = useState("");
  const [wPlaintiffId, setWPlaintiffId] = useState("");
  const [wPlaintiffPhone, setWPlaintiffPhone] = useState("");
  const [wPlaintiffAddress, setWPlaintiffAddress] = useState("");

  const [wDefendantName, setWDefendantName] = useState("");
  const [wDefendantId, setWDefendantId] = useState("");
  const [wDefendantPhone, setWDefendantPhone] = useState("");
  const [wDefendantAddress, setWDefendantAddress] = useState("");

  // Step 3: Case details
  const [wCaseNumber, setWCaseNumber] = useState("");
  const [wCaseYear, setWCaseYear] = useState(new Date().getFullYear());
  const [wCourtName, setWCourtName] = useState<LegalCaseData["courtName"]>("محكمة الصلح");
  const [wCaseType, setWCaseType] = useState<LegalCaseData["caseType"]>("حقوقي");
  const [wClaimAmount, setWClaimAmount] = useState("");
  
  const [wizardError, setWizardError] = useState("");

  // Auto-fill client details based on chosen Client & ClientRole
  useEffect(() => {
    if (!wClientId) return;
    const selectedClient = clients.find(cl => cl.id === Number(wClientId));
    if (!selectedClient) return;

    if (wClientRole === "المدعي") {
      // Auto-fill Plaintiff with client info
      setWPlaintiffName(selectedClient.name);
      setWPlaintiffId(selectedClient.nationalId || "");
      setWPlaintiffPhone(selectedClient.phone || "");
      
      // Clear defendant values so they can enter opponent
      setWDefendantName("");
      setWDefendantId("");
      setWDefendantPhone("");
      setWDefendantAddress("");
    } else {
      // Auto-fill Defendant with client info
      setWDefendantName(selectedClient.name);
      setWDefendantId(selectedClient.nationalId || "");
      setWDefendantPhone(selectedClient.phone || "");

      // Clear plaintiff values so they can enter opponent
      setWPlaintiffName("");
      setWPlaintiffId("");
      setWPlaintiffPhone("");
      setWPlaintiffAddress("");
    }
  }, [wClientId, wClientRole, clients]);

  // Form States - Wakala
  const [newWakalaNumber, setNewWakalaNumber] = useState("");
  const [newWakalaClientId, setNewWakalaClientId] = useState<string>("");
  const [newWakalaNotary, setNewWakalaNotary] = useState("");
  const [newWakalaType, setNewWakalaType] = useState<WakalaData["type"]>("عامة");
  const [newWakalaDate, setNewWakalaDate] = useState(new Date().toISOString().split("T")[0]);
  const [wakalaError, setWakalaError] = useState("");

  // Metric Computations
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === "مفتوحة" || c.status === "نشطة").length;
  const totalClaims = cases.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  const totalExpenses = legalFinancials.reduce((sum, f) => sum + (f.amount || 0), 0);

  // Filters logic
  const filteredCases = cases.filter(c => {
    const client = clients.find(cl => cl.id === c.clientId);
    const clientName = client ? client.name : "";
    const matchesSearch = 
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.year.toString().includes(searchQuery) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.plaintiffName && c.plaintiffName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.defendantName && c.defendantName.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCourt = courtFilter ? c.courtName === courtFilter : true;
    const matchesType = typeFilter ? c.caseType === typeFilter : true;
    const matchesStatus = statusFilter ? c.status === statusFilter : true;

    return matchesSearch && matchesCourt && matchesType && matchesStatus;
  });

  const filteredWakalas = wakalas.filter(w => {
    const client = clients.find(cl => cl.id === w.clientId);
    const clientName = client ? client.name : "";
    return (
      w.wakalaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.notaryPublicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Hearings Agenda logic (Upcoming hearings with nextSessionDate)
  const agendaHearings = hearings
    .filter(h => h.nextSessionDate)
    .sort((a, b) => new Date(a.nextSessionDate!).getTime() - new Date(b.nextSessionDate!).getTime());

  // Handlers - Next wizard step validation
  const handleWizardNext = () => {
    setWizardError("");

    if (wizardStep === 1) {
      if (!wClientId) {
        setWizardError("الرجاء اختيار الموكيل أولاً.");
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!wPlaintiffName || !wDefendantName) {
        setWizardError("الرجاء إدخال أسماء أطراف القضية (المدعي والمدعى عليه).");
        return;
      }
      setWizardStep(3);
    } else if (wizardStep === 3) {
      if (!wCaseNumber || !wCaseYear) {
        setWizardError("الرجاء تعبئة رقم القضية وسنة التسجيل.");
        return;
      }
      
      // Enforce unique Case + Court + Year validation
      const duplicate = cases.some(
        c => c.caseNumber === wCaseNumber && c.year === Number(wCaseYear) && c.courtName === wCourtName
      );

      if (duplicate) {
        setWizardError("رقم الدعوى هذا مسجل بالفعل لنفس السنة والمحكمة.");
        return;
      }
      setWizardStep(4);
    }
  };

  // Submit case wizard
  const handleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardError("");

    const newCaseObj: LegalCaseData = {
      id: `c-${Date.now()}`,
      clientId: Number(wClientId),
      caseNumber: wCaseNumber,
      year: Number(wCaseYear),
      courtName: wCourtName,
      caseType: wCaseType,
      status: "مفتوحة",
      claimAmount: Number(wClaimAmount) || 0,
      clientRole: wClientRole,
      plaintiffName: wPlaintiffName,
      plaintiffId: wPlaintiffId,
      plaintiffPhone: wPlaintiffPhone,
      plaintiffAddress: wPlaintiffAddress,
      defendantName: wDefendantName,
      defendantId: wDefendantId,
      defendantPhone: wDefendantPhone,
      defendantAddress: wDefendantAddress
    };

    setCases([...cases, newCaseObj]);
    setShowAddCaseWizard(false);
    
    // Reset Form & Steps
    setWizardStep(1);
    setWClientId("");
    setWCaseNumber("");
    setWCaseYear(new Date().getFullYear());
    setWClaimAmount("");
  };

  // Handlers - Add Wakala
  const handleAddWakalaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWakalaError("");

    if (!newWakalaClientId || !newWakalaNumber || !newWakalaNotary) {
      setWakalaError("الرجاء تعبئة جميع الحقول المطلوبة.");
      return;
    }

    const duplicate = wakalas.some(w => w.wakalaNumber === newWakalaNumber);
    if (duplicate) {
      setWakalaError("رقم الوكالة هذا مسجل مسبقاً.");
      return;
    }

    const newWakalaObj: WakalaData = {
      id: `w-${Date.now()}`,
      clientId: Number(newWakalaClientId),
      wakalaNumber: newWakalaNumber,
      notaryPublicName: newWakalaNotary,
      type: newWakalaType,
      issueDate: newWakalaDate,
      status: "Active"
    };

    setWakalas([...wakalas, newWakalaObj]);
    setShowAddWakalaModal(false);
    setNewWakalaNumber("");
    setNewWakalaClientId("");
    setNewWakalaNotary("");
  };

  const toggleWakalaStatus = (id: string) => {
    setWakalas(wakalas.map(w => w.id === id ? { ...w, status: w.status === "Active" ? "Revoked" : "Active" } : w));
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {activeTab === "cases" && "سجل القضايا القضائية"}
            {activeTab === "wakalas" && "سجل الوكالات العدلية"}
            {activeTab === "agenda" && "أجندة وجدول الجلسات"}
            {activeTab === "financials" && "الحسابات والمصاريف القضائية"}
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">
            {activeTab === "cases" && "متابعة وتصنيف ملفات القضايا المنظورة أمام المحاكم الأردنية"}
            {activeTab === "wakalas" && "توثيق الوكالات الخاصة والعامة الصادرة عن كاتب العدل"}
            {activeTab === "agenda" && "جدول مواعيد جلسات المحكمة القادمة والقرارات المطلوبة للتقديم"}
            {activeTab === "financials" && "إدارة النفقات والرسوم وأتعاب المحاماة والخبرة لكل قضية"}
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "cases" && (
            <button
              onClick={() => {
                setWizardStep(1);
                setShowAddCaseWizard(true);
              }}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>تسجيل قضية جديدة (مساعد الخطوات)</span>
            </button>
          )}
          {activeTab === "wakalas" && (
            <button
              onClick={() => setShowAddWakalaModal(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة وكالة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Renders Metrics summary */}
      {activeTab === "cases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-slate-500 mb-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Scale className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-600">إجمالي القضايا</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{totalCases}</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold">قيد النظر (النشطة)</h3>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">{activeCases}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-indigo-600 mb-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold">إجمالي قيمة المطالبات</h3>
            </div>
            <p className="text-3xl font-extrabold text-indigo-600">د.أ {totalClaims.toLocaleString()}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold">إجمالي الرسوم والمصاريف</h3>
            </div>
            <p className="text-3xl font-extrabold text-rose-600">د.أ {totalExpenses.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Tabs Menu Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => router.push("/cases?tab=cases")}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "cases"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          سجل القضايا القضائية
        </button>
        <button
          onClick={() => router.push("/cases?tab=wakalas")}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "wakalas"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          الوكالات العدلية
        </button>
        <button
          onClick={() => router.push("/cases?tab=agenda")}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "agenda"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          أجندة الجلسات
        </button>
        <button
          onClick={() => router.push("/cases?tab=financials")}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "financials"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          المالية والرسوم
        </button>
      </div>

      {/* Search and filtering block */}
      {(activeTab === "cases" || activeTab === "wakalas") && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={activeTab === "cases" ? "ابحث برقم الدعوى، الموكل، أو أطراف النزاع..." : "ابحث برقم الوكالة أو كاتب العدل..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-600 focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          {activeTab === "cases" && (
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={courtFilter}
                onChange={e => setCourtFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
              >
                <option value="">كل المحاكم</option>
                <option value="محكمة الصلح">محكمة الصلح</option>
                <option value="محكمة البداية">محكمة البداية</option>
                <option value="محكمة الاستئناف">محكمة الاستئناف</option>
                <option value="محكمة التمييز">محكمة التمييز</option>
                <option value="محكمة شرعية">محكمة شرعية</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
              >
                <option value="">كل الأنواع</option>
                <option value="حقوقي">حقوقي</option>
                <option value="جزائي">جزائي</option>
                <option value="شرعي">شرعي</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
              >
                <option value="">كل الحالات</option>
                <option value="مفتوحة">مفتوحة</option>
                <option value="مغلقة">مغلقة</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Tab Render Switch */}
      {activeTab === "cases" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(c => {
            const client = clients.find(cl => cl.id === c.clientId);
            return (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black text-slate-500">سنة {c.year}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                      c.status === "مفتوحة" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-slate-700" />
                    <span>رقم الدعوى: {c.caseNumber}</span>
                  </h3>
                  
                  <div className="space-y-2 mt-4 text-sm font-semibold text-slate-600 border-b border-slate-100 pb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">الموكل:</span>
                      <span className="text-slate-900">{client ? client.name : "غير معروف"} ({c.clientRole})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">الخصم المقابل:</span>
                      <span className="text-slate-900 font-extrabold">
                        {c.clientRole === "المدعي" ? c.defendantName : c.plaintiffName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">المحكمة:</span>
                      <span className="text-slate-900 font-extrabold">{c.courtName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">النوع:</span>
                      <span className="text-slate-900 font-extrabold">{c.caseType}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500">قيمة المطالبة</p>
                    <p className="text-base font-black text-indigo-700 mt-0.5">د.أ {c.claimAmount.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => router.push(`/cases/${c.id}`)}
                    className="bg-slate-55 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>تفاصيل القضية كاملة</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredCases.length === 0 && (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
              <p className="text-sm font-bold text-slate-500 italic">لم يتم العثور على أي قضايا تطابق خيارات البحث.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "wakalas" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-black text-slate-500">رقم الوكالة</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500">الموكل</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500">كاتب العدل</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500">النوع</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500">تاريخ الإصدار</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500">الحالة</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWakalas.map(w => {
                  const client = clients.find(cl => cl.id === w.clientId);
                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-black text-slate-900">{w.wakalaNumber}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">{client ? client.name : "غير معروف"}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600">{w.notaryPublicName}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-bold">{w.type}</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-600">{w.issueDate}</td>
                      <td className="py-4 px-6 text-sm font-bold">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                          w.status === "Active" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}>
                          {w.status === "Active" ? "فعالة" : "ملغاة / معزولة"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-center">
                        <button 
                          onClick={() => toggleWakalaStatus(w.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                            w.status === "Active" 
                              ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-600 hover:text-white" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          {w.status === "Active" ? "إلغاء الوكالة" : "تفعيل الوكالة"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "agenda" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span>جدول مواعيد الجلسات القادمة</span>
          </h3>
          
          {agendaHearings.length === 0 ? (
            <p className="text-sm font-bold text-slate-500 italic p-6 text-center bg-slate-50 rounded-2xl border border-dashed">لا توجد جلسات مجدولة قريباً.</p>
          ) : (
            <div className="space-y-4">
              {agendaHearings.map(h => {
                const c = cases.find(cs => cs.id === h.caseId);
                const client = c ? clients.find(cl => cl.id === c.clientId) : null;
                return (
                  <div key={h.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
                          ميعاد الجلسة: {new Date(h.nextSessionDate!).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {c && (
                          <span className="text-xs font-extrabold text-slate-800">رقم القضية: {c.caseNumber} / {c.year} ({c.courtName})</span>
                        )}
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 mt-1">الموكل: {client ? client.name : "غير معروف"}</p>
                      {h.requiredActions && (
                        <p className="text-xs text-rose-700 font-bold mt-1 bg-rose-50/50 p-2 rounded-lg w-fit border border-rose-100">الإجراء المطلوب: {h.requiredActions}</p>
                      )}
                    </div>
                    {c && (
                      <button 
                        onClick={() => router.push(`/cases/${c.id}`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-sm"
                      >
                        <span>فتح ملف القضية</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "financials" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <span>كشف حساب النفقات القضائية العام</span>
            </h3>
            <span className="text-base font-black text-rose-600">إجمالي المصاريف المسجلة: د.أ {totalExpenses.toLocaleString()}</span>
          </div>

          {legalFinancials.length === 0 ? (
            <p className="text-sm font-bold text-slate-500 italic p-6 text-center bg-slate-50 rounded-2xl border border-dashed">لم يتم قيد أي عمليات دفع أو رسوم بعد.</p>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-6 font-extrabold">القضية (رقم/سنة)</th>
                      <th className="py-3 px-6 font-extrabold">الموكل</th>
                      <th className="py-3 px-6 font-extrabold">نوع الرسم/المصروف</th>
                      <th className="py-3 px-6 font-extrabold">التاريخ</th>
                      <th className="py-3 px-6 font-extrabold text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {legalFinancials.map(f => {
                      const c = cases.find(cs => cs.id === f.caseId);
                      const client = c ? clients.find(cl => cl.id === c.clientId) : null;
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-6 font-black text-slate-900">{c ? `${c.caseNumber} / ${c.year}` : "قضية مؤرشفة"}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-800">{client ? client.name : "غير معروف"}</td>
                          <td className="py-3.5 px-6 font-bold text-slate-600">{f.type}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-600">{f.date}</td>
                          <td className="py-3.5 px-6 font-black text-rose-600 text-left">د.أ {f.amount.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* ADD CASE WIZARD MODAL (Multi-step form)    */}
      {/* ========================================== */}
      {showAddCaseWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col p-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-slate-700" />
                  <span>مساعد تسجيل دعوى قضائية جديدة</span>
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1">الخطوة {wizardStep} من 4</p>
              </div>
              <button 
                onClick={() => { setShowAddCaseWizard(false); setWizardError(""); }} 
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress indicators */}
            <div className="grid grid-cols-4 gap-2 mb-6 text-center text-[10px] font-black text-slate-500">
              <div className={`py-2 rounded-lg border ${wizardStep >= 1 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200"}`}>1. الموكل والصفة</div>
              <div className={`py-2 rounded-lg border ${wizardStep >= 2 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200"}`}>2. أطراف الخصومة</div>
              <div className={`py-2 rounded-lg border ${wizardStep >= 3 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200"}`}>3. بيانات المحكمة</div>
              <div className={`py-2 rounded-lg border ${wizardStep >= 4 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200"}`}>4. المراجعة والتاكيد</div>
            </div>

            {wizardError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 mb-4">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{wizardError}</span>
              </div>
            )}

            <form onSubmit={handleWizardSubmit} className="space-y-5 flex-1">
              
              {/* STEP 1: Select Client & Role */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">اختر الموكل المسجل في النظام</label>
                    <select 
                      value={wClientId} 
                      onChange={e => setWClientId(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                      required
                    >
                      <option value="">-- اختر الموكل --</option>
                      {clients.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.name} (الرقم الوطني: {cl.nationalId || "غير متوفر"})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">صفة الموكل في الدعوى</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setWClientRole("المدعي")}
                        className={`py-3 px-4 rounded-xl border text-sm font-black transition-all ${
                          wClientRole === "المدعي" 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        المدعي (Plaintiff)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWClientRole("المدعى عليه")}
                        className={`py-3 px-4 rounded-xl border text-sm font-black transition-all ${
                          wClientRole === "المدعى عليه" 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        المدعى عليه (Defendant)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Parties Information */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  {/* Plaintiff details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 border-b pb-2 flex justify-between items-center">
                      <span>الجهة المدعية (المدعي)</span>
                      {wClientRole === "المدعي" && <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">الموكل الخاص بنا (تعبئة تلقائية)</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">الاسم بالكامل</label>
                        <input 
                          type="text" 
                          value={wPlaintiffName} 
                          onChange={e => setWPlaintiffName(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">الرقم الوطني / رقم المنشأة</label>
                        <input 
                          type="text" 
                          placeholder="الرقم الوطني (10 أرقام)"
                          value={wPlaintiffId} 
                          onChange={e => setWPlaintiffId(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">رقم الهاتف</label>
                        <input 
                          type="text" 
                          value={wPlaintiffPhone} 
                          onChange={e => setWPlaintiffPhone(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">العنوان بالتفصيل</label>
                        <input 
                          type="text" 
                          value={wPlaintiffAddress} 
                          onChange={e => setWPlaintiffAddress(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Defendant details */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 border-b pb-2 flex justify-between items-center">
                      <span>الجهة المدعى عليها (المدعى عليه)</span>
                      {wClientRole === "المدعى عليه" && <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">الموكل الخاص بنا (تعبئة تلقائية)</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">الاسم بالكامل / الخصم</label>
                        <input 
                          type="text" 
                          value={wDefendantName} 
                          onChange={e => setWDefendantName(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">الرقم الوطني / رقم المنشأة للخصم</label>
                        <input 
                          type="text" 
                          placeholder="الرقم الوطني (10 أرقام)"
                          value={wDefendantId} 
                          onChange={e => setWDefendantId(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">رقم الهاتف للخصم</label>
                        <input 
                          type="text" 
                          value={wDefendantPhone} 
                          onChange={e => setWDefendantPhone(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">العنوان للخصم بالتفصيل</label>
                        <input 
                          type="text" 
                          value={wDefendantAddress} 
                          onChange={e => setWDefendantAddress(e.target.value)} 
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Case details */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الدعوى</label>
                      <input 
                        type="text" 
                        placeholder="مثال: 543" 
                        value={wCaseNumber} 
                        onChange={e => setWCaseNumber(e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">السنة</label>
                      <input 
                        type="number" 
                        value={wCaseYear} 
                        onChange={e => setWCaseYear(Number(e.target.value))} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">المحكمة المختصة</label>
                      <select 
                        value={wCourtName} 
                        onChange={e => setWCourtName(e.target.value as any)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="محكمة الصلح">محكمة الصلح</option>
                        <option value="محكمة البداية">محكمة البداية</option>
                        <option value="محكمة الاستئناف">محكمة الاستئناف</option>
                        <option value="محكمة التمييز">محكمة التمييز</option>
                        <option value="محكمة شرعية">محكمة شرعية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع الدعوى</label>
                      <select 
                        value={wCaseType} 
                        onChange={e => setWCaseType(e.target.value as any)} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="حقوقي">حقوقي</option>
                        <option value="جزائي">جزائي</option>
                        <option value="شرعي">شرعي</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">قيمة المطالبة المالية (د.أ)</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={wClaimAmount} 
                      onChange={e => setWClaimAmount(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Review and Summary */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-sm font-semibold">
                    <h4 className="text-base font-black text-slate-900 border-b pb-2">ملخص بيانات ملف الدعوى الجديد</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-xs">رقم القضية:</span>
                        <span className="text-slate-900 font-extrabold text-base">{wCaseNumber} / {wCaseYear}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">المحكمة والنوع:</span>
                        <span className="text-slate-900 font-extrabold">{wCourtName} ({wCaseType})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">قيمة المطالبة:</span>
                        <span className="text-indigo-700 font-black">د.أ {Number(wClaimAmount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">الموكل والصفة:</span>
                        <span className="text-emerald-700 font-extrabold">{clients.find(c => c.id === Number(wClientId))?.name} ({wClientRole})</span>
                      </div>
                    </div>

                    <hr className="border-slate-200" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <span className="font-black text-slate-900 block border-b pb-1.5 mb-1.5 text-indigo-700">المدعي (Plaintiff)</span>
                        <p><span className="text-slate-400">الاسم:</span> {wPlaintiffName}</p>
                        {wPlaintiffId && <p><span className="text-slate-400">الرقم الوطني:</span> {wPlaintiffId}</p>}
                        {wPlaintiffPhone && <p><span className="text-slate-400">الهاتف:</span> {wPlaintiffPhone}</p>}
                        {wPlaintiffAddress && <p><span className="text-slate-400">العنوان:</span> {wPlaintiffAddress}</p>}
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                        <span className="font-black text-slate-900 block border-b pb-1.5 mb-1.5 text-rose-700">المدعى عليه (Defendant)</span>
                        <p><span className="text-slate-400">الاسم:</span> {wDefendantName}</p>
                        {wDefendantId && <p><span className="text-slate-400">الرقم الوطني:</span> {wDefendantId}</p>}
                        {wDefendantPhone && <p><span className="text-slate-400">الهاتف:</span> {wDefendantPhone}</p>}
                        {wDefendantAddress && <p><span className="text-slate-400">العنوان:</span> {wDefendantAddress}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                {wizardStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                )}
                
                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleWizardNext}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-sm font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد تسجيل ملف القضية</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ADD WAKALA MODAL                           */}
      {/* ========================================== */}
      {showAddWakalaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-slate-700" />
                <span>إضافة وكالة عدلية جديدة</span>
              </h3>
              <button onClick={() => { setShowAddWakalaModal(false); setWakalaError(""); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {wakalaError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 mb-4">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{wakalaError}</span>
              </div>
            )}

            <form onSubmit={handleAddWakalaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الموكل</label>
                <select 
                  value={newWakalaClientId} 
                  onChange={e => setNewWakalaClientId(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                  required
                >
                  <option value="">-- اختر الموكل --</option>
                  {clients.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الوكالة</label>
                <input 
                  type="text" 
                  placeholder="مثال: وكالة-123/2026" 
                  value={newWakalaNumber} 
                  onChange={e => setNewWakalaNumber(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">كاتب العدل (مكان إصدار الوكالة)</label>
                <input 
                  type="text" 
                  placeholder="مثال: كاتب عدل عمان" 
                  value={newWakalaNotary} 
                  onChange={e => setNewWakalaNotary(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">النوع</label>
                  <select 
                    value={newWakalaType} 
                    onChange={e => setNewWakalaType(e.target.value as any)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="عامة">عامة</option>
                    <option value="خاصة">خاصة</option>
                    <option value="جزئية">جزئية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">تاريخ الإصدار</label>
                  <input 
                    type="date" 
                    value={newWakalaDate} 
                    onChange={e => setNewWakalaDate(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900" 
                    required 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowAddWakalaModal(false); setWakalaError(""); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold shadow-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-sm"
                >
                  حفظ الوكالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 font-bold text-slate-600">جاري تحميل البيانات...</div>}>
      <CasesPageContent />
    </Suspense>
  );
}
