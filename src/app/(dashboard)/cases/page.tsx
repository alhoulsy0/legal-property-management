"use client";

import { useState } from "react";
import { useGlobal, LegalCaseData, WakalaData, HearingData, LegalFinancialData } from "../GlobalProvider";
import { Scale, FileText, Calendar, DollarSign, Plus, Search, User, Clock, ArrowLeft, AlertTriangle, ShieldCheck, Check, Trash2, X, Activity } from "lucide-react";

export default function CasesPage() {
  const { 
    clients, 
    cases, setCases, 
    wakalas, setWakalas, 
    hearings, setHearings, 
    legalFinancials, setLegalFinancials 
  } = useGlobal();

  // Active Tab: "cases" | "wakalas"
  const [activeTab, setActiveTab] = useState<"cases" | "wakalas">("cases");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals Toggle
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAddWakalaModal, setShowAddWakalaModal] = useState(false);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState<LegalCaseData | null>(null);

  // Form States - Case
  const [newCaseNumber, setNewCaseNumber] = useState("");
  const [newCaseYear, setNewCaseYear] = useState(new Date().getFullYear());
  const [newCaseClientId, setNewCaseClientId] = useState<string>("");
  const [newCaseCourt, setNewCaseCourt] = useState<LegalCaseData["courtName"]>("محكمة الصلح");
  const [newCaseType, setNewCaseType] = useState<LegalCaseData["caseType"]>("حقوقي");
  const [newCaseStatus, setNewCaseStatus] = useState("مفتوحة");
  const [newCaseClaimAmt, setNewCaseClaimAmt] = useState("");
  const [caseError, setCaseError] = useState("");

  // Form States - Wakala
  const [newWakalaNumber, setNewWakalaNumber] = useState("");
  const [newWakalaClientId, setNewWakalaClientId] = useState<string>("");
  const [newWakalaNotary, setNewWakalaNotary] = useState("");
  const [newWakalaType, setNewWakalaType] = useState<WakalaData["type"]>("عامة");
  const [newWakalaDate, setNewWakalaDate] = useState(new Date().toISOString().split("T")[0]);
  const [wakalaError, setWakalaError] = useState("");

  // Case Detail Pane Form States
  const [detailTab, setDetailTab] = useState<"hearings" | "financials">("hearings");
  
  // New Hearing Form States
  const [newHearingDate, setNewHearingDate] = useState("");
  const [newHearingPanel, setNewHearingPanel] = useState("");
  const [newHearingNotes, setNewHearingNotes] = useState("");
  const [newHearingNextDate, setNewHearingNextDate] = useState("");
  const [newHearingActions, setNewHearingActions] = useState("");

  // New Financial Expense Form States
  const [newFinType, setNewFinType] = useState<LegalFinancialData["type"]>("رسوم محاكم");
  const [newFinAmt, setNewFinAmt] = useState("");
  const [newFinDate, setNewFinDate] = useState(new Date().toISOString().split("T")[0]);

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
      clientName.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  // Handlers - Add Case
  const handleAddCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCaseError("");

    if (!newCaseClientId || !newCaseNumber) {
      setCaseError("الرجاء تعبئة جميع الحقول المطلوبة.");
      return;
    }

    // Enforce unique Case + Court + Year validation
    const duplicate = cases.some(
      c => c.caseNumber === newCaseNumber && c.year === Number(newCaseYear) && c.courtName === newCaseCourt
    );

    if (duplicate) {
      setCaseError("رقم الدعوى هذا مسجل بالفعل لنفس السنة والمحكمة.");
      return;
    }

    const newCaseObj: LegalCaseData = {
      id: `c-${Date.now()}`,
      clientId: Number(newCaseClientId),
      caseNumber: newCaseNumber,
      year: Number(newCaseYear),
      courtName: newCaseCourt,
      caseType: newCaseType,
      status: newCaseStatus,
      claimAmount: Number(newCaseClaimAmt) || 0
    };

    setCases([...cases, newCaseObj]);
    setShowAddCaseModal(false);
    // Reset Form
    setNewCaseNumber("");
    setNewCaseYear(new Date().getFullYear());
    setNewCaseClientId("");
    setNewCaseClaimAmt("");
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

  // Handlers - Add Hearing
  const handleAddHearing = (e: React.FormEvent, caseId: string) => {
    e.preventDefault();
    if (!newHearingDate) return;

    const newHearing: HearingData = {
      id: `h-${Date.now()}`,
      caseId,
      sessionDate: new Date(newHearingDate).toISOString(),
      judicialPanel: newHearingPanel,
      notes: newHearingNotes,
      nextSessionDate: newHearingNextDate ? new Date(newHearingNextDate).toISOString() : undefined,
      requiredActions: newHearingActions
    };

    setHearings([...hearings, newHearing]);
    
    // Reset Form
    setNewHearingDate("");
    setNewHearingPanel("");
    setNewHearingNotes("");
    setNewHearingNextDate("");
    setNewHearingActions("");
  };

  // Handlers - Add Financial Record
  const handleAddFinancial = (e: React.FormEvent, caseId: string) => {
    e.preventDefault();
    if (!newFinAmt) return;

    const newFin: LegalFinancialData = {
      id: `f-${Date.now()}`,
      caseId,
      type: newFinType,
      amount: Number(newFinAmt),
      date: newFinDate
    };

    setLegalFinancials([...legalFinancials, newFin]);
    setNewFinAmt("");
  };

  // Toggle Wakala Status
  const toggleWakalaStatus = (id: string) => {
    setWakalas(wakalas.map(w => w.id === id ? { ...w, status: w.status === "Active" ? "Revoked" : "Active" } : w));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">إدارة القضايا والوكالات</h1>
          <p className="text-slate-500 mt-1 text-sm font-semibold">متابعة ملفات القضايا الأردنية، الوكالات، الجلسات، والمصاريف القضائية</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "cases" ? (
            <button
              onClick={() => setShowAddCaseModal(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>تسجيل قضية جديدة</span>
            </button>
          ) : (
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

      {/* Metrics Summary (Shown only when in Cases Tab) */}
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
              <h3 className="text-sm font-bold">القضايا المنظورة (النشطة)</h3>
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

      {/* Tabs Selection */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab("cases"); setSearchQuery(""); }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "cases"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          ملفات القضايا القانونية
        </button>
        <button
          onClick={() => { setActiveTab("wakalas"); setSearchQuery(""); }}
          className={`py-3 px-6 font-bold text-sm transition-all border-b-2 ${
            activeTab === "wakalas"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          سجل الوكالات (Power of Attorney)
        </button>
      </div>

      {/* Control Filters and Search bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={activeTab === "cases" ? "ابحث برقم الدعوى أو الموكل..." : "ابحث برقم الوكالة أو كاتب العدل..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-600 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          {/* Tab Specific Filters */}
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
      </div>

      {/* Main Content Area */}
      {activeTab === "cases" ? (
        // Cases Grid List
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(c => {
            const client = clients.find(cl => cl.id === c.clientId);
            return (
              <div key={c.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">سنة {c.year}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
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
                      <span className="text-slate-900">{client ? client.name : "غير معروف"}</span>
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
                    onClick={() => {
                      setSelectedCaseDetail(c);
                      setDetailTab("hearings");
                    }}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <span>التفاصيل والجلسات</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-slate-600" />
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
      ) : (
        // Wakalas (Power of Attorney) Table List
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">رقم الوكالة</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">الموكل</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">كاتب العدل</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">النوع</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ الإصدار</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الإجراءات</th>
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
                {filteredWakalas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm font-bold text-slate-400 italic">لم يتم العثور على أي وكالات مسجلة.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ADD CASE MODAL                             */}
      {/* ========================================== */}
      {showAddCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Scale className="w-6 h-6 text-slate-700" />
                <span>تسجيل ملف دعوى جديدة</span>
              </h3>
              <button onClick={() => { setShowAddCaseModal(false); setCaseError(""); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {caseError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm font-bold flex items-center gap-2.5 mb-4">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{caseError}</span>
              </div>
            )}

            <form onSubmit={handleAddCaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الموكل (المدعي/المدعى عليه)</label>
                <select 
                  value={newCaseClientId} 
                  onChange={e => setNewCaseClientId(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                  required
                >
                  <option value="">-- اختر الموكل --</option>
                  {clients.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} (الرقم الوطني: {cl.nationalId || "غير متوفر"})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الدعوى</label>
                  <input 
                    type="text" 
                    placeholder="مثال: 543" 
                    value={newCaseNumber} 
                    onChange={e => setNewCaseNumber(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">السنة</label>
                  <input 
                    type="number" 
                    value={newCaseYear} 
                    onChange={e => setNewCaseYear(Number(e.target.value))} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">المحكمة</label>
                  <select 
                    value={newCaseCourt} 
                    onChange={e => setNewCaseCourt(e.target.value as any)} 
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
                    value={newCaseType} 
                    onChange={e => setNewCaseType(e.target.value as any)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="حقوقي">حقوقي</option>
                    <option value="جزائي">جزائي</option>
                    <option value="شرعي">شرعي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">قيمة المطالبة (د.أ)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newCaseClaimAmt} 
                    onChange={e => setNewCaseClaimAmt(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-semibold text-slate-900 placeholder-slate-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">حالة الدعوى</label>
                  <select 
                    value={newCaseStatus} 
                    onChange={e => setNewCaseStatus(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none text-sm font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="مفتوحة">مفتوحة (قيد النظر)</option>
                    <option value="مغلقة">مغلقة (مفصولة)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setShowAddCaseModal(false); setCaseError(""); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold shadow-sm"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold shadow-sm"
                >
                  حفظ الدعوى
                </button>
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

      {/* ========================================== */}
      {/* CASE DETAIL & HEARINGS & EXPENSES MODAL    */}
      {/* ========================================== */}
      {selectedCaseDetail && (() => {
        const client = clients.find(cl => cl.id === selectedCaseDetail.clientId);
        // Find Active Wakala for this client
        const clientWakala = wakalas.find(w => w.clientId === selectedCaseDetail.clientId && w.status === "Active");
        // Get case hearings
        const caseHearings = hearings.filter(h => h.caseId === selectedCaseDetail.id).sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
        // Get case financials
        const caseFinancialsList = legalFinancials.filter(f => f.caseId === selectedCaseDetail.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalExpensesSum = caseFinancialsList.reduce((sum, f) => sum + f.amount, 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-slate-700" />
                    <span>ملف الدعوى رقم: {selectedCaseDetail.caseNumber} / {selectedCaseDetail.year}</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">{selectedCaseDetail.courtName} - {selectedCaseDetail.caseType}</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedCaseDetail.status}
                    onChange={(e) => {
                      setCases(cases.map(c => c.id === selectedCaseDetail.id ? { ...c, status: e.target.value } : c));
                      setSelectedCaseDetail({ ...selectedCaseDetail, status: e.target.value });
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none shadow-sm cursor-pointer"
                  >
                    <option value="مفتوحة">مفتوحة</option>
                    <option value="مغلقة">مغلقة</option>
                  </select>
                  <button 
                    onClick={() => setSelectedCaseDetail(null)} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Info panel */}
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-semibold text-slate-600">
                <div>
                  <span className="text-slate-500 block text-xs font-bold mb-1">الموكل والبيانات الوطنية:</span>
                  <span className="text-slate-900 font-extrabold text-base block">{client?.name || "غير معروف"}</span>
                  <span className="text-slate-500 text-xs mt-1 block">الرقم الوطني: {client?.nationalId || "غير متوفر"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-bold mb-1">الوكالة العدلية المعمول بها:</span>
                  {clientWakala ? (
                    <div>
                      <span className="text-emerald-700 font-extrabold text-sm block">{clientWakala.wakalaNumber} ({clientWakala.type})</span>
                      <span className="text-slate-500 text-xs block">تاريخ الإصدار: {clientWakala.issueDate}</span>
                    </div>
                  ) : (
                    <span className="text-rose-600 font-bold text-xs flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> لا توجد وكالة عدلية فعالة مسجلة
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block text-xs font-bold mb-1">المطالبة المالية والرسوم:</span>
                  <span className="text-slate-900 font-black block">المطالبة: د.أ {selectedCaseDetail.claimAmount.toLocaleString()}</span>
                  <span className="text-rose-600 font-bold block text-xs mt-0.5">المصاريف: د.أ {totalExpensesSum.toLocaleString()}</span>
                </div>
              </div>

              {/* Tabs for hearings vs financials */}
              <div className="flex border-b border-slate-100 bg-white px-6">
                <button 
                  onClick={() => setDetailTab("hearings")}
                  className={`py-3.5 px-5 font-bold text-xs tracking-wide uppercase transition-all border-b-2 ${
                    detailTab === "hearings" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  الجلسات والقرارات ({caseHearings.length})
                </button>
                <button 
                  onClick={() => setDetailTab("financials")}
                  className={`py-3.5 px-5 font-bold text-xs tracking-wide uppercase transition-all border-b-2 ${
                    detailTab === "financials" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  المصاريف والرسوم القضائية
                </button>
              </div>

              {/* Content Panels */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
                {detailTab === "hearings" ? (
                  // Hearings log
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Add session Form */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 h-fit">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>تسجيل جلسة جديدة</span>
                      </h4>
                      <form onSubmit={(e) => handleAddHearing(e, selectedCaseDetail.id)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">تاريخ الجلسة</label>
                            <input 
                              type="datetime-local" 
                              value={newHearingDate} 
                              onChange={e => setNewHearingDate(e.target.value)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">الهيئة القضائية</label>
                            <input 
                              type="text" 
                              placeholder="مثال: القاضي أحمد الفايز" 
                              value={newHearingPanel} 
                              onChange={e => setNewHearingPanel(e.target.value)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">مذكرات وقائع الجلسة</label>
                          <textarea 
                            rows={3} 
                            placeholder="تفاصيل الجلسة، البينات المقدمة..." 
                            value={newHearingNotes} 
                            onChange={e => setNewHearingNotes(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">موعد الجلسة القادمة (إن وُجد)</label>
                            <input 
                              type="datetime-local" 
                              value={newHearingNextDate} 
                              onChange={e => setNewHearingNextDate(e.target.value)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">القرارات / الإجراءات المطلوبة</label>
                            <input 
                              type="text" 
                              placeholder="تبليغ شهود، دفع رسوم..." 
                              value={newHearingActions} 
                              onChange={e => setNewHearingActions(e.target.value)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                            />
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          تأكيد حفظ الجلسة
                        </button>
                      </form>
                    </div>

                    {/* Timeline logs */}
                    <div className="space-y-6">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>سجل الجلسات</span>
                      </h4>
                      {caseHearings.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">لم يتم تسجيل أي جلسة لهذه القضية بعد.</p>
                      ) : (
                        <div className="space-y-4">
                          {caseHearings.map(h => (
                            <div key={h.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-extrabold text-indigo-800">{new Date(h.sessionDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                {h.judicialPanel && <span className="text-[10px] font-bold text-slate-500">{h.judicialPanel}</span>}
                              </div>
                              <p className="text-xs text-slate-700 font-semibold leading-relaxed">{h.notes || "لا توجد ملاحظات تفصيلية"}</p>
                              {(h.nextSessionDate || h.requiredActions) && (
                                <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-3 text-[10px] font-bold text-slate-600">
                                  {h.nextSessionDate && (
                                    <div>
                                      <span className="text-slate-400 block mb-0.5">موعد الجلسة القادمة:</span>
                                      <span className="text-amber-700">{new Date(h.nextSessionDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
                                    </div>
                                  )}
                                  {h.requiredActions && (
                                    <div>
                                      <span className="text-slate-400 block mb-0.5">الإجراء المطلـوب:</span>
                                      <span className="text-rose-700">{h.requiredActions}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Financial ledger
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Add financial expense Form */}
                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 h-fit">
                      <h4 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>تسجيل مصروف أو رسوم جديدة</span>
                      </h4>
                      <form onSubmit={(e) => handleAddFinancial(e, selectedCaseDetail.id)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">نوع المصروف</label>
                            <select 
                              value={newFinType} 
                              onChange={e => setNewFinType(e.target.value as any)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 cursor-pointer"
                            >
                              <option value="رسوم محاكم">رسوم محاكم</option>
                              <option value="أتعاب محاماة">أتعاب محاماة</option>
                              <option value="أتعاب خبرة">أتعاب خبرة</option>
                              <option value="طوابع">طوابع</option>
                              <option value="أخرى">أخرى</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 mb-1">التاريخ</label>
                            <input 
                              type="date" 
                              value={newFinDate} 
                              onChange={e => setNewFinDate(e.target.value)} 
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900" 
                              required 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">القيمة (د.أ)</label>
                          <input 
                            type="number" 
                            placeholder="0.00" 
                            value={newFinAmt} 
                            onChange={e => setNewFinAmt(e.target.value)} 
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600" 
                            required 
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          إضافة للرصيد
                        </button>
                      </form>
                    </div>

                    {/* Financial log */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-500" />
                          <span>كشف الحساب والمصاريف للقضية</span>
                        </h4>
                        <span className="text-xs font-black text-rose-700">مجموع المصاريف: د.أ {totalExpensesSum.toLocaleString()}</span>
                      </div>
                      
                      {caseFinancialsList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">لم يتم تسجيل أي مصاريف مالية بعد.</p>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-right text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-500 border-b border-slate-200">
                                  <th className="py-2.5 px-4 font-extrabold">النوع</th>
                                  <th className="py-2.5 px-4 font-extrabold">التاريخ</th>
                                  <th className="py-2.5 px-4 font-extrabold text-left">المبلغ</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {caseFinancialsList.map(f => (
                                  <tr key={f.id} className="hover:bg-slate-100 transition-colors">
                                    <td className="py-2.5 px-4 font-bold text-slate-800">{f.type}</td>
                                    <td className="py-2.5 px-4 font-semibold text-slate-600">{f.date}</td>
                                    <td className="py-2.5 px-4 font-black text-rose-600 text-left">د.أ {f.amount.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
