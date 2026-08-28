"use client";
import html2canvas from "html2canvas";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Building, Plus, FileText, DollarSign, MapPin, UploadCloud, User, Calendar as CalendarIcon, Clock, Edit2, TrendingUp, TrendingDown, AlertTriangle, Trash2, Download, Receipt, Send, CheckCircle2, FileBarChart, Copy } from "lucide-react";
import { useGlobal, PropertyData, ExpenseData } from "../../GlobalProvider";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = Number(params.id);

  const { clients, properties, setProperties } = useGlobal();

  const client = clients.find(c => c.id === clientId);
  const clientProperties = properties.filter(p => p.clientId === clientId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState("سكني");
  const [newPropLocation, setNewPropLocation] = useState("");
  const [newPropTenant, setNewPropTenant] = useState("");
  const [newPropFreq, setNewPropFreq] = useState("شهري (الأول من الشهر)");
  const [newPropStatus, setNewPropStatus] = useState("نشط");
  const [newPropRev, setNewPropRev] = useState("");
  const [newPropRentAmount, setNewPropRentAmount] = useState("");
  const [newPropDuration, setNewPropDuration] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nextRentDate, setNextRentDate] = useState("");

  const [showExpensesFor, setShowExpensesFor] = useState<number | null>(null);
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmt, setNewExpenseAmt] = useState("");

  const [showIssuesFor, setShowIssuesFor] = useState<number | null>(null);
  const [newIssueDesc, setNewIssueDesc] = useState("");

  const [showPayoutFor, setShowPayoutFor] = useState<number | null>(null);
  const [showRentCyclesFor, setShowRentCyclesFor] = useState<number | null>(null);
  const [payoutMethod, setPayoutMethod] = useState("تحويل بنكي");
  const [txId, setTxId] = useState("");
  const [payoutDocName, setPayoutDocName] = useState("");

  const [extendingPropId, setExtendingPropId] = useState<number | null>(null);
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [confirmAction, setConfirmAction] = useState<{type: string, payload?: any} | null>(null);

  const handleExtendContract = (propId: number) => {
    const prop = properties.find(p => p.id === propId);
    if (!prop || !prop.rentAmount || !extendMonths) return;

    let cycles = prop.rentCycles ? [...prop.rentCycles] : [];
    let lastDate = new Date();
    if (cycles.length > 0) {
      lastDate = new Date(cycles[cycles.length - 1].dueDate);
    } else if (prop.endDate) {
      lastDate = new Date(prop.endDate);
    }

    for (let i = 1; i <= extendMonths; i++) {
      const d = new Date(lastDate);
      d.setMonth(d.getMonth() + i);
      cycles.push({
        id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
        dueDate: d.toISOString().split("T")[0],
        amount: Number(prop.rentAmount),
        receivedFromTenant: false,
        paidToLandlord: false
      });
    }

    let newEndDate = prop.endDate;
    if (newEndDate) {
      const eDate = new Date(newEndDate);
      eDate.setMonth(eDate.getMonth() + extendMonths);
      newEndDate = eDate.toISOString().split("T")[0];
    }

    const updatedProps = properties.map(p => {
      if (p.id === propId) {
        return {
          ...p,
          rentCycles: cycles,
          durationMonths: (p.durationMonths || 0) + extendMonths,
          revenue: (p.revenue || 0) + (extendMonths * p.rentAmount!),
          endDate: newEndDate || p.endDate
        };
      }
      return p;
    });

    setProperties(updatedProps);
    setExtendingPropId(null);
    setExtendMonths(1);
  };

  const [showLedger, setShowLedger] = useState(false);

  const totalRevenue = clientProperties.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  const totalExpenses = clientProperties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + (Number(eCurr.amount) || 0), 0) || 0);
  }, 0);
  const netCashFlow = totalRevenue - totalExpenses;

  const ledgerData: any[] = [];
  clientProperties.forEach(p => {
    ledgerData.push({ type: "إيراد", desc: `إيجار متوقع: ${p.name}`, amount: p.revenue, date: p.nextRentDate || "-", status: p.payoutStatus === "Paid to Landlord" ? "تم التحويل" : "قيد التحصيل" });
    p.expenses?.forEach(exp => {
      ledgerData.push({ type: "مصروف", desc: `${p.name}: ${exp.description}`, amount: -exp.amount, date: exp.date, status: "مخصوم" });
    });
  });

  const exportPDF = async () => {
    const ledgerEl = document.getElementById("ledger-report");
    if (!ledgerEl) {
      alert("الرجاء فتح الكشف المالي أولاً لتصديره");
      return;
    }
    try {
      const canvas = await html2canvas(ledgerEl, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${client?.name}_Financial_Report.pdf`);
    } catch(err) {
      console.error(err);
    }
  };
  
  const activeCount = clientProperties.filter(p => p.status === 'Active' || p.status === 'نشط').length;
  const delayedCount = clientProperties.filter(p => p.status === 'Delayed' || p.status === 'متأخر' || p.status === 'قضية').length;

  const openAdd = () => {
    setEditingId(null);
    setNewPropName(""); setNewPropType("سكني"); setNewPropLocation(""); setNewPropTenant(""); setNewPropFreq("شهري (الأول من الشهر)"); setNewPropStatus("نشط"); setNewPropRev(""); setNewPropRentAmount(""); setNewPropDuration(""); setUploadedFiles([]);
    setStartDate(""); setEndDate(""); setNextRentDate("");
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (prop: PropertyData) => {
    setEditingId(prop.id);
    setNewPropName(prop.name); setNewPropType(prop.type); setNewPropLocation(prop.location); setNewPropTenant(prop.tenant !== "N/A" ? prop.tenant : ""); setNewPropFreq(prop.paymentFreq); setNewPropStatus(prop.status); setNewPropRev(prop.revenue.toString()); setNewPropRentAmount(prop.rentAmount?.toString() || ""); setNewPropDuration(prop.durationMonths?.toString() || ""); setUploadedFiles(prop.documents || []);
    setStartDate(prop.startDate || ""); setEndDate(prop.endDate || ""); setNextRentDate(prop.nextRentDate || "");
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicateProperty = (prop: PropertyData) => {
    const duplicatedProp = {
      ...prop,
      id: Date.now(),
      name: `${prop.name} (نسخة)`,
    };
    setProperties([...properties, duplicatedProp]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDeleteProperty = () => {
    if (editingId) {
      setProperties(properties.filter(p => p.id !== editingId));
      setIsAdding(false);
      setConfirmAction(null);
    }
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropName && newPropLocation) {
      let calculatedStatus = newPropStatus;
      if (nextRentDate && new Date(nextRentDate) < new Date() && calculatedStatus === "نشط") {
        calculatedStatus = "متأخر";
      }

      let generatedCycles = editingId ? properties.find(p=>p.id === editingId)?.rentCycles || [] : [];
      if (!editingId && startDate && newPropDuration && newPropRentAmount) {
        let sDate = new Date(startDate);
        for (let i = 0; i < Number(newPropDuration); i++) {
          const d = new Date(sDate);
          d.setMonth(d.getMonth() + i);
          generatedCycles.push({
            id: Date.now().toString() + "-" + i,
            dueDate: d.toISOString().split("T")[0],
            amount: Number(newPropRentAmount),
            receivedFromTenant: false,
            paidToLandlord: false
          });
        }
      }

      const propertyData: PropertyData = {
        id: editingId || Date.now(),
        clientId: clientId,
        type: newPropType,
        name: newPropName,
        location: newPropLocation,
        tenant: newPropTenant || "غير محدد",
        status: calculatedStatus,
        paymentFreq: newPropFreq,
        revenue: (Number(newPropRentAmount) * Number(newPropDuration)) || Number(newPropRev) || 0,
        rentAmount: Number(newPropRentAmount),
        durationMonths: Number(newPropDuration),
        rentCycles: generatedCycles,
        documents: uploadedFiles,
        expenses: editingId ? properties.find(p=>p.id === editingId)?.expenses || [] : [],
        issues: editingId ? properties.find(p=>p.id === editingId)?.issues || [] : [],
        startDate,
        endDate,
        nextRentDate,
        payoutStatus: editingId ? properties.find(p=>p.id === editingId)?.payoutStatus || "قيد التحصيل" : "قيد التحصيل",
        payoutMethod: editingId ? properties.find(p=>p.id === editingId)?.payoutMethod : "",
        payoutTransactionId: editingId ? properties.find(p=>p.id === editingId)?.payoutTransactionId : "",
        payoutDocument: editingId ? properties.find(p=>p.id === editingId)?.payoutDocument : ""
      };

      if (editingId) {
        setProperties(properties.map(p => p.id === editingId ? propertyData : p));
      } else {
        setProperties([...properties, propertyData]);
      }
      setIsAdding(false);
    }
  };

  const handleDownload = (docName: string) => {
    const blob = new Blob(["محتوى تجريبي للمستند: " + docName], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddIssue = (e: React.FormEvent, propertyId: number) => {
    e.preventDefault();
    if (newIssueDesc) {
      const newIssue = {
        id: Date.now(),
        description: newIssueDesc,
        date: new Date().toLocaleDateString('ar-EG'),
        status: "مفتوحة"
      };
      setProperties(properties.map(p => p.id === propertyId ? { ...p, issues: [...(p.issues || []), newIssue] } : p));
      setNewIssueDesc("");
    }
  };

  const handleAddExpense = (e: React.FormEvent, propertyId: number) => {
    e.preventDefault();
    if (newExpenseDesc && newExpenseAmt) {
      const newExp: ExpenseData = {
        id: Date.now(),
        description: newExpenseDesc,
        amount: Number(newExpenseAmt),
        date: new Date().toISOString().split('T')[0]
      };
      setProperties(properties.map(p => p.id === propertyId ? { ...p, expenses: [...(p.expenses || []), newExp] } : p));
      setNewExpenseDesc("");
      setNewExpenseAmt("");
    }
  };

  const handlePayoutSubmit = (e: React.FormEvent, propertyId: number) => {
    e.preventDefault();
    if (payoutMethod === "نقدي" || txId) {
      setProperties(properties.map(p => p.id === propertyId ? { ...p, payoutStatus: "Paid to Landlord", payoutMethod: payoutMethod, payoutTransactionId: txId, payoutDocument: payoutDocName } : p));
      setTxId("");
      setPayoutMethod("تحويل بنكي");
      setPayoutDocName("");
      setShowPayoutFor(null);
    }
  };

  const calculateDays = (targetDate: string) => {
    if (!targetDate) return null;
    const diffTime = new Date(targetDate).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!client) {
    return <div className="p-10 text-center font-bold text-slate-500">لم يتم العثور على الموكل. <Link href="/clients" className="text-blue-600 underline">العودة</Link></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/clients" className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-900 border border-slate-300">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            محفظة الموكل: {client.name}
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">إدارة العقود، النزاعات، والمصروفات الخاصة بالموكل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">الإيراد المتوقع</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-rose-100 text-rose-700 rounded-2xl shadow-sm"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">إجمالي المصروفات</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">${totalExpenses.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800 flex items-center gap-5">
          <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-sm"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-300">صافي التدفقات</p>
            <p className="text-2xl font-extrabold text-white mt-1">${netCashFlow.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl shadow-sm"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">تأخير / نزاعات</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{delayedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">العقارات المسجلة</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLedger(true)} className="bg-slate-100 text-slate-900 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold flex items-center space-x-2 text-sm shadow-sm">
            <FileBarChart className="w-5 h-5" />
            <span>السجل المالي للمالك</span>
          </button>
          <button onClick={openAdd} className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors font-bold flex items-center space-x-2 text-sm">
            <Plus className="w-5 h-5" />
            <span>إضافة عقار جديد</span>
          </button>
        </div>
      </div>

      {showLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{client.name} - السجل المالي</h3>
                <p className="text-sm text-slate-500 font-bold mt-1">كشف حساب موحد للإيرادات والمصروفات</p>
              </div>
              <div className="flex gap-3">
                <button onClick={exportPDF} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 font-bold text-sm shadow-md flex items-center gap-2">
                  <Download className="w-4 h-4" /> تصدير PDF
                </button>
                <button onClick={() => setShowLedger(false)} className="bg-white text-slate-700 border border-slate-300 px-5 py-2.5 rounded-xl hover:bg-slate-100 font-bold text-sm shadow-sm">
                  إغلاق
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div id="ledger-report" className="bg-white p-6 rounded-xl">
                {/* Print Title */}
                <div className="mb-6 border-b border-slate-200 pb-4">
                  <h3 className="text-2xl font-extrabold text-slate-900">{client?.name} - كشف حساب مفصل</h3>
                  <p className="text-sm text-slate-500 font-bold mt-1">تاريخ الإصدار: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <p className="text-sm font-extrabold text-slate-500 tracking-wider mb-1">إجمالي الإيرادات</p>
                  <p className="text-2xl font-black text-slate-900">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                  <p className="text-sm font-extrabold text-rose-600 tracking-wider mb-1">إجمالي الخصومات</p>
                  <p className="text-2xl font-black text-rose-700">${totalExpenses.toLocaleString()}</p>
                </div>
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <p className="text-sm font-extrabold text-emerald-700 tracking-wider mb-1">الصافي المستحق للمالك</p>
                  <p className="text-2xl font-black text-emerald-700">${netCashFlow.toLocaleString()}</p>
                </div>
              </div>

              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/50">
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">التاريخ</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">النوع</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">الوصف</th>
                    <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-600 border-b border-slate-200">المبلغ</th>
                    <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-600 border-b border-slate-200">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerData.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-slate-500 font-bold">لا توجد حركات مالية مسجلة.</td></tr>
                  ) : (
                    ledgerData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-bold text-slate-700">{item.date}</td>
                        <td className="py-3 px-4 text-sm font-bold">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] tracking-wider ${item.type === 'إيراد' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{item.type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-900">{item.desc}</td>
                        <td className={`py-3 px-4 text-left text-sm font-extrabold ${item.amount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{item.amount < 0 ? `-$${Math.abs(item.amount)}` : `$${item.amount}`}</td>
                        <td className="py-3 px-4 text-left text-sm font-bold text-slate-500">{item.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 mb-6 relative overflow-hidden">
          <h3 className="text-2xl font-extrabold mb-6 text-slate-900 border-b border-slate-100 pb-4">{editingId ? 'تعديل بيانات العقار' : 'تسجيل عقار جديد'}</h3>
          <form onSubmit={handleSaveProperty} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-bold text-slate-800 mb-2">اسم العقار / الوحدة</label>
                <input type="text" value={newPropName} onChange={(e) => setNewPropName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" required placeholder="مثال: شقة رقم 5 - عمارة الياسمين" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">نوع العقار</label>
                <select value={newPropType} onChange={(e) => setNewPropType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>سكني</option><option>تجاري</option><option>صناعي</option><option>أرض</option>
                </select>
              </div>
              <div className="col-span-full lg:col-span-1">
                <label className="block text-sm font-bold text-slate-800 mb-2">الموقع / العنوان</label>
                <input type="text" value={newPropLocation} onChange={(e) => setNewPropLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" required placeholder="عمان - شارع الاستقلال" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">اسم المستأجر</label>
                <input type="text" value={newPropTenant} onChange={(e) => setNewPropTenant(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="أحمد محمد" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">تاريخ بداية العقد</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">تاريخ انتهاء العقد</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">تاريخ استحقاق الإيجار القادم</label>
                <input type="date" value={nextRentDate} onChange={(e) => setNextRentDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">قيمة الإيجار الشهري ($)</label>
                <input type="number" value={newPropRentAmount} onChange={(e) => setNewPropRentAmount(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">مدة العقد (بالأشهر)</label>
                <input type="number" value={newPropDuration} onChange={(e) => setNewPropDuration(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="12" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">الحالة القانونية</label>
                <select value={newPropStatus} onChange={(e) => setNewPropStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>نشط</option><option>متأخر</option><option>قضية منظورة</option><option>محجوز</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-bold text-slate-800 mb-2">إرفاق مستندات (عقود، هويات، أحكام)</label>
                <div className="relative w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-3 transition-colors" />
                  <p className="text-sm font-extrabold text-slate-700">انقر للرفع أو اسحب الملفات هنا</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">PDF, DOCX حد أقصى 10MB</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-800 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-xs font-semibold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
              <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 font-bold text-sm transition-colors shadow-md">
                {editingId ? 'حفظ التعديلات' : 'تسجيل العقار'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm">
                إلغاء
              </button>
              {editingId && (
                <button type="button" onClick={() => setConfirmAction({type: 'deleteProperty'})} className="mr-auto bg-rose-50 text-rose-700 border border-rose-200 px-5 py-3 rounded-xl hover:bg-rose-100 font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> حذف
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 bg-transparent lg:bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-slate-200">
        <div className="flex flex-col gap-4 lg:gap-0 lg:px-6">
        {clientProperties.map((prop) => {
          const rentDaysLeft = calculateDays(prop.nextRentDate || "");
          const contractDaysLeft = calculateDays(prop.endDate || "");
          const isRentLate = rentDaysLeft !== null && rentDaysLeft < 0;

          return (
          <div key={prop.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 lg:p-0 lg:bg-transparent lg:rounded-none lg:shadow-none lg:border-0 lg:border-b lg:border-slate-200 lg:last:border-0 flex flex-col justify-between group transition-colors hover:bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 py-2 lg:py-4">
               {/* Info Col */}
               <div className="flex items-center gap-4 w-full lg:w-1/4">
                 <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shrink-0">
                   <Building className="w-6 h-6" />
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-base font-extrabold text-slate-900 truncate">{prop.name}</h3>
                   <p className="text-sm font-bold text-slate-500 truncate mt-0.5">{prop.type} • {prop.location}</p>
                 </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:flex-1 bg-slate-50 lg:bg-transparent p-4 lg:p-0 rounded-2xl lg:rounded-none border border-slate-100 lg:border-0">
                 <div>
                   <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">المستأجر</p>
                   <p className="text-sm font-bold text-slate-800 truncate">{prop.tenant}</p>
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">الإيجار الشهري</p>
                   <p className="text-sm font-black text-indigo-700">${prop.rentAmount?.toLocaleString() || prop.revenue?.toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">الاستحقاق القادم</p>
                    <p className={`text-sm font-bold ${isRentLate ? 'text-rose-600' : 'text-slate-800'}`}>
                      {prop.nextRentDate || "غير محدد"}
                      {isRentLate && <span className="ml-2 text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">متأخر</span>}
                    </p>
                 </div>
                 <div className="flex items-center">
                    <div className="w-full">
                      <p className="text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider block lg:hidden">الحالة</p>
                      <span className={`px-3 py-1.5 text-xs font-extrabold rounded-lg shadow-sm border whitespace-nowrap ${
                        prop.status === 'نشط' || prop.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        prop.status === 'متأخر' || prop.status === 'Delayed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        prop.status === 'محجوز' ? 'bg-slate-800 text-white border-slate-900' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                 </div>
               </div>

               {/* Actions Array */}
               <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full lg:w-auto pt-2 lg:pt-0 justify-start lg:justify-end">
                  {prop.documents && prop.documents.length > 0 && (
                    <button onClick={() => handleDownload(prop.documents![0].name)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100" title="تحميل المستندات">
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => {setShowRentCyclesFor(showRentCyclesFor === prop.id ? null : prop.id); setShowIssuesFor(null); setShowExpensesFor(null); setShowPayoutFor(null);}} className={`p-2.5 rounded-xl transition-colors border ${showRentCyclesFor === prop.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'}`} title="جدول الدفعات">
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => {setShowIssuesFor(showIssuesFor === prop.id ? null : prop.id); setShowRentCyclesFor(null); setShowExpensesFor(null); setShowPayoutFor(null);}} className={`p-2.5 rounded-xl transition-colors border ${showIssuesFor === prop.id ? 'bg-amber-600 text-white border-amber-700 shadow-md' : 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100'}`} title="قضايا ومشاكل">
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  <button onClick={() => {setShowExpensesFor(showExpensesFor === prop.id ? null : prop.id); setShowRentCyclesFor(null); setShowIssuesFor(null); setShowPayoutFor(null);}} className={`p-2.5 rounded-xl transition-colors border ${showExpensesFor === prop.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200'}`} title="المصروفات">
                    <Receipt className="w-5 h-5" />
                  </button>
                  <button onClick={() => {setShowPayoutFor(showPayoutFor === prop.id ? null : prop.id); setShowRentCyclesFor(null); setShowExpensesFor(null); setShowIssuesFor(null);}} className={`p-2.5 rounded-xl transition-colors border ${showPayoutFor === prop.id ? 'bg-emerald-600 text-white border-emerald-700 shadow-md' : prop.payoutStatus === 'Paid to Landlord' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100'}`} title="تحويل للمالك">
                    {prop.payoutStatus === 'Paid to Landlord' ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </button>

                  <div className="hidden lg:block w-px h-8 bg-slate-200 mx-2"></div>

                  <button onClick={() => setConfirmAction({ type: 'duplicateProperty', payload: prop })} className="p-2.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 shadow-sm" title="نسخ العقار">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button onClick={() => openEdit(prop)} className="p-2.5 text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shadow-sm" title="تعديل">
                    <Edit2 className="w-5 h-5" />
                  </button>
               </div>
            </div>

              {showRentCyclesFor === prop.id && (() => {
                const totalExpected = prop.revenue || 0;
                const totalCollected = (prop.rentCycles || []).reduce((acc: number, curr: any) => curr.receivedFromTenant ? acc + curr.amount : acc, 0);
                const remaining = Math.max(0, totalExpected - totalCollected);
                const percent = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
                
                return (
                <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                    <h4 className="text-sm font-extrabold text-indigo-800 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-indigo-600" /> جدول دفعات الإيجار والتمديد</h4>
                    <button onClick={() => setExtendingPropId(extendingPropId === prop.id ? null : prop.id)} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm">
                      + تمديد العقد
                    </button>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-500 mb-1">إجمالي قيمة العقد (المتوقع)</p>
                        <p className="text-lg font-black text-slate-900">${totalExpected.toLocaleString()}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-500 mb-1">المتبقي للتحصيل</p>
                        <p className="text-lg font-black text-rose-600">${remaining.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                      <span>تم التحصيل: ${totalCollected.toLocaleString()} ({percent}%)</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {extendingPropId === prop.id && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-4 animate-in fade-in">
                      <p className="text-xs font-bold text-indigo-800 mb-2">أدخل مدة التمديد (بالأشهر):</p>
                      <div className="flex gap-2">
                        <input type="number" min="1" value={extendMonths} onChange={(e) => setExtendMonths(Number(e.target.value))} className="px-3 py-2 border border-indigo-200 rounded-lg text-sm w-24 outline-none focus:ring-2 focus:ring-indigo-600 font-bold bg-white" />
                        <button onClick={() => handleExtendContract(prop.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">تأكيد التمديد</button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="py-2 px-3 text-xs font-black text-slate-500 border-b border-slate-200 rounded-tr-lg">تاريخ الاستحقاق</th>
                          <th className="py-2 px-3 text-xs font-black text-slate-500 border-b border-slate-200">المبلغ</th>
                          <th className="py-2 px-3 text-xs font-black text-slate-500 border-b border-slate-200">استلام من المستأجر</th>
                          <th className="py-2 px-3 text-xs font-black text-slate-500 border-b border-slate-200 rounded-tl-lg">تحويل للمالك</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(prop.rentCycles || []).length === 0 ? (
                           <tr><td colSpan={4} className="text-sm text-slate-500 font-semibold italic py-4">لم يتم توليد جدول دفعات.</td></tr>
                        ) : (
                          prop.rentCycles?.map(cycle => (
                            <tr key={cycle.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 text-sm font-bold text-slate-800">{cycle.dueDate}</td>
                              <td className="py-3 px-3 text-sm font-bold text-indigo-700">${cycle.amount}</td>
                              <td className="py-3 px-3 text-sm font-bold">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={cycle.receivedFromTenant} onChange={(e) => {
                                    const updated = properties.map(p => p.id === prop.id ? {...p, rentCycles: p.rentCycles?.map(c => c.id === cycle.id ? {...c, receivedFromTenant: e.target.checked} : c)} : p);
                                    setProperties(updated);
                                  }} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                  <span className={cycle.receivedFromTenant ? "text-emerald-600" : "text-slate-500"}>
                                    {cycle.receivedFromTenant ? "تم الاستلام" : "قيد الانتظار"}
                                  </span>
                                </label>
                              </td>
                              <td className="py-3 px-3 text-sm font-bold">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={cycle.paidToLandlord} onChange={(e) => {
                                    const updated = properties.map(p => p.id === prop.id ? {...p, rentCycles: p.rentCycles?.map(c => c.id === cycle.id ? {...c, paidToLandlord: e.target.checked} : c)} : p);
                                    setProperties(updated);
                                  }} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                  <span className={cycle.paidToLandlord ? "text-emerald-600" : "text-slate-500"}>
                                    {cycle.paidToLandlord ? "تم التحويل" : "معلق"}
                                  </span>
                                </label>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                );
              })()}

              {showIssuesFor === prop.id && (
                <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-extrabold text-amber-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> القضايا والمشاكل القانونية</h4>
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto custom-scrollbar">
                    {(prop.issues || []).length === 0 ? (
                       <p className="text-sm text-slate-500 font-semibold italic">لا توجد قضايا أو مشاكل مسجلة.</p>
                    ) : (
                      prop.issues?.map(issue => (
                        <div key={issue.id} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{issue.description}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{issue.date}</p>
                          </div>
                          <span className="font-extrabold text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{issue.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={(e) => handleAddIssue(e, prop.id)} className="flex gap-3">
                    <input type="text" placeholder="اكتب وصف المشكلة أو القضية (مثال: تأخر المستأجر 3 أشهر)..." value={newIssueDesc} onChange={(e) => setNewIssueDesc(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-slate-900 outline-none" required />
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm shadow-sm whitespace-nowrap">حفظ الملاحظة</button>
                  </form>
                </div>
              )}

              {showExpensesFor === prop.id && (
                <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-500" /> مصروفات العقار المخصومة</h4>
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto custom-scrollbar">
                    {(prop.expenses || []).length === 0 ? (
                       <p className="text-sm text-slate-500 font-semibold italic">لا توجد مصروفات مسجلة.</p>
                    ) : (
                      prop.expenses?.map(exp => (
                        <div key={exp.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{exp.description}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{exp.date}</p>
                          </div>
                          <span className="font-extrabold text-rose-600">${exp.amount}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={(e) => handleAddExpense(e, prop.id)} className="flex flex-wrap gap-3">
                    <input type="text" placeholder="وصف المصروف (مثال: صيانة سباكة)..." value={newExpenseDesc} onChange={(e) => setNewExpenseDesc(e.target.value)} className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-slate-900 outline-none" required />
                    <input type="number" placeholder="المبلغ $" value={newExpenseAmt} onChange={(e) => setNewExpenseAmt(e.target.value)} className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-slate-900 outline-none" required />
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm shadow-sm whitespace-nowrap">إضافة</button>
                  </form>
                </div>
              )}

              {showPayoutFor === prop.id && (
                <div className="border-t border-slate-200 pt-4 animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-extrabold text-blue-800 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-blue-600" /> إثبات تحويل للمالك</h4>
                  {prop.payoutStatus === 'Paid to Landlord' ? (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> تمت تصفية الحساب للمالك</p>
                      <p className="text-sm text-emerald-700 mt-2 font-semibold">طريقة الدفع: {prop.payoutMethod}</p>
                      {prop.payoutTransactionId && <p className="text-sm text-emerald-700 mt-1 font-semibold">رقم الحوالة/الإيصال: {prop.payoutTransactionId}</p>}
                      {prop.payoutDocument && <p className="text-sm text-emerald-700 mt-1 font-semibold">المستند: {prop.payoutDocument}</p>}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handlePayoutSubmit(e, prop.id)} className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة التوريد</label>
                        <select value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-sm">
                          <option>تحويل بنكي</option>
                          <option>نقدي</option>
                        </select>
                      </div>
                      {payoutMethod === "تحويل بنكي" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الحوالة البنكية</label>
                          <input type="text" placeholder="مثال: TXN-982374" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-600 outline-none shadow-sm" required />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">إرفاق إيصال / مخالصة (اختياري)</label>
                        <input type="file" onChange={(e) => setPayoutDocName(e.target.files?.[0]?.name || "")} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 text-sm shadow-sm transition-colors">
                        تأكيد تحويل الصافي للمالك
                      </button>
                    </form>
                  )}
                </div>
              )}
          </div>
        )})}
        {clientProperties.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <Building className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-xl font-extrabold text-slate-700">لا توجد عقارات مسجلة للموكل</p>
            <p className="text-sm font-semibold mt-2 text-slate-500">قم بتسجيل عقار جديد لبدء إدارة المحفظة.</p>
          </div>
        )}
      </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {confirmAction.type === 'deleteProperty' && 'تأكيد الحذف'}
                  {confirmAction.type === 'duplicateProperty' && 'تأكيد النسخ'}
                </h3>
                <p className="text-sm font-bold text-slate-500 mt-1">
                  {confirmAction.type === 'deleteProperty' && 'هل أنت متأكد من رغبتك في حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.'}
                  {confirmAction.type === 'duplicateProperty' && 'هل تريد إنشاء نسخة جديدة من هذا العقار؟'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  if (confirmAction.type === 'deleteProperty') {
                    handleDeleteProperty();
                  } else if (confirmAction.type === 'duplicateProperty') {
                    handleDuplicateProperty(confirmAction.payload);
                  }
                  setConfirmAction(null);
                }}
                className="flex-1 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                تأكيد
              </button>
              <button 
                onClick={() => setConfirmAction(null)} 
                className="flex-1 bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
