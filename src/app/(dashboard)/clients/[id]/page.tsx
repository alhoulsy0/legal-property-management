"use client";
import html2canvas from "html2canvas";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Building, Plus, FileText, DollarSign, MapPin, UploadCloud, User, Calendar as CalendarIcon, Clock, Edit2, TrendingUp, TrendingDown, AlertTriangle, Trash2, Download, Receipt, Send, CheckCircle2, FileBarChart, Copy, Archive } from "lucide-react";
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
  const [newPropFreq, setNewPropFreq] = useState("شهري - نفس يوم البداية");
  const [newPropStatus, setNewPropStatus] = useState("نشط");
  const [newPropRev, setNewPropRev] = useState("");
  const [newPropRentAmount, setNewPropRentAmount] = useState("");
  const [newPropDuration, setNewPropDuration] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nextRentDate, setNextRentDate] = useState("");

  const [expandedPropId, setExpandedPropId] = useState<number | null>(null);
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmt, setNewExpenseAmt] = useState("");
  const [newIssueDesc, setNewIssueDesc] = useState("");
  
  const [increaseRentPropId, setIncreaseRentPropId] = useState<number | null>(null);
  const [increaseRentAmount, setIncreaseRentAmount] = useState<string>("");
  const [increaseRentDate, setIncreaseRentDate] = useState<string>("");

  const [payoutMethod, setPayoutMethod] = useState("تحويل بنكي");
  const [txId, setTxId] = useState("");
  const [payoutDocName, setPayoutDocName] = useState("");

  const [extendingPropId, setExtendingPropId] = useState<number | null>(null);
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [confirmAction, setConfirmAction] = useState<{type: string, payload?: any} | null>(null);

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      if (m > 0 && !newPropDuration) {
        setNewPropDuration(m.toString());
      }
    }
  }, [startDate, endDate]);

  const handleArchiveProperty = (propId: number) => {
    const updatedProps = properties.map(p => {
      if (p.id === propId) {
        return { ...p, status: "منتهي / مسودة" };
      }
      return p;
    });
    setProperties(updatedProps);
    setConfirmAction(null);
  };

  const handleIncreaseRent = (propId: number) => {
    const prop = properties.find(p => p.id === propId);
    if (!prop || !increaseRentAmount || !increaseRentDate) return;

    const newAmount = Number(increaseRentAmount);
    if (isNaN(newAmount) || newAmount <= 0) return;

    let cycles = prop.rentCycles ? [...prop.rentCycles] : [];
    
    // Update all cycles starting from the selected date's cycle index
    const startIndex = cycles.findIndex(c => c.dueDate === increaseRentDate);
    if (startIndex > -1) {
      cycles = cycles.map((c, i) => {
        if (i >= startIndex) {
          return { ...c, amount: newAmount };
        }
        return c;
      });
    }

    const newRevenue = cycles.reduce((acc, c) => acc + c.amount, 0);

    const updatedProps = properties.map(p => {
      if (p.id === propId) {
        return { ...p, rentCycles: cycles, rentAmount: newAmount, revenue: newRevenue };
      }
      return p;
    });

    setProperties(updatedProps);
    setIncreaseRentPropId(null);
    setIncreaseRentAmount("");
    setIncreaseRentDate("");
  };

  const handleExtendContract = (propId: number) => {
    const prop = properties.find(p => p.id === propId);
    if (!prop || !extendMonths) return;

    let cycles = prop.rentCycles ? [...prop.rentCycles] : [];
    let lastDate = new Date();
    if (cycles.length > 0) {
      lastDate = new Date(cycles[cycles.length - 1].dueDate);
    } else if (prop.endDate) {
      lastDate = new Date(prop.endDate);
    }

    const freq = prop.paymentFreq || "شهري";
    let monthStep = 1;
    if (freq.includes("ربع سنوي")) monthStep = 3;
    else if (freq.includes("نصف سنوي")) monthStep = 6;
    else if (freq.includes("سنوي")) monthStep = 12;

    const cyclesToAdd = Math.ceil(extendMonths / monthStep);
    
    // Cycle amount is either the rentAmount (single payment) or derived from previous cycles
    const cycleAmount = Number(prop.rentAmount) || (cycles.length > 0 ? cycles[0].amount : (prop.revenue && prop.durationMonths ? Math.round((prop.revenue / prop.durationMonths) * monthStep) : 0));

    const lastDateStr = cycles.length > 0 ? cycles[cycles.length - 1].dueDate : (prop.endDate || new Date().toISOString().split("T")[0]);
    const [lYear, lMonth, lDay] = lastDateStr.split('-').map(Number);

    for (let i = 1; i <= cyclesToAdd; i++) {
      let targetMonth = lMonth - 1 + (i * monthStep);
      let targetDay = lDay;
      
      if (freq.includes("بداية الشهر")) {
         targetDay = 1;
      } else if (freq.includes("نهاية الشهر")) {
         targetMonth += 1;
         targetDay = 0;
      } else {
         const lastDay = new Date(lYear, targetMonth + 1, 0).getDate();
         targetDay = Math.min(lDay, lastDay);
      }
      
      const d = new Date(lYear, targetMonth, targetDay);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');

      cycles.push({
        id: Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9),
        dueDate: `${y}-${m}-${dy}`,
        amount: cycleAmount,
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
        const firstUnpaid = cycles.find(c => !c.receivedFromTenant);
        const updatedNextRentDate = firstUnpaid ? firstUnpaid.dueDate : (newEndDate || p.endDate);
        
        let newStatus = p.status;
        if (updatedNextRentDate && new Date(updatedNextRentDate) < new Date() && newStatus === 'نشط') {
           newStatus = 'متأخر';
        } else if (updatedNextRentDate && new Date(updatedNextRentDate) >= new Date() && newStatus === 'متأخر') {
           newStatus = 'نشط';
        }

        return {
          ...p,
          rentCycles: cycles,
          durationMonths: (p.durationMonths || 0) + extendMonths,
          revenue: (p.revenue || 0) + (cyclesToAdd * cycleAmount),
          endDate: newEndDate || p.endDate,
          nextRentDate: updatedNextRentDate,
          status: newStatus
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
      let dur = Number(newPropDuration);
      if (!dur && startDate && endDate) {
          const s = new Date(startDate);
          const e = new Date(endDate);
          dur = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
      }
      if (dur <= 0 && startDate) dur = 1;

      const oldProp = editingId ? properties.find(p=>p.id === editingId) : null;
      let oldCycles = oldProp?.rentCycles || [];

      let generatedCycles = oldCycles;
      if (startDate && newPropRentAmount) {
        generatedCycles = [];
        let monthStep = 1;
        let cycleCount = dur;

        if (newPropFreq.includes("ربع سنوي")) {
           monthStep = 3;
           cycleCount = Math.ceil(dur / 3);
        } else if (newPropFreq.includes("نصف سنوي")) {
           monthStep = 6;
           cycleCount = Math.ceil(dur / 6);
        } else if (newPropFreq.includes("سنوي")) {
           monthStep = 12;
           cycleCount = Math.ceil(dur / 12);
        }

        const [sYear, sMonth, sDay] = startDate.split('-').map(Number);

        for (let i = 0; i < cycleCount; i++) {
          let targetMonth = sMonth - 1 + (i * monthStep);
          let targetDay = sDay;
          
          if (newPropFreq.includes("بداية الشهر")) {
             targetDay = 1;
          } else if (newPropFreq.includes("نهاية الشهر")) {
             targetMonth += 1;
             targetDay = 0;
          } else {
             const lastDay = new Date(sYear, targetMonth + 1, 0).getDate();
             targetDay = Math.min(sDay, lastDay);
          }
          
          const d = new Date(sYear, targetMonth, targetDay);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const dy = String(d.getDate()).padStart(2, '0');

          const oldCycle = oldCycles[i];

          generatedCycles.push({
            id: oldCycle ? oldCycle.id : Date.now().toString() + "-" + i + "-" + Math.random().toString(36).substr(2, 5),
            dueDate: `${y}-${m}-${dy}`,
            amount: Number(newPropRentAmount),
            receivedFromTenant: oldCycle ? oldCycle.receivedFromTenant : false,
            paidToLandlord: oldCycle ? oldCycle.paidToLandlord : false
          });
        }
      }

      let derivedEndDate = endDate;
      if (!derivedEndDate && startDate && dur > 0) {
         const eDate = new Date(startDate);
         eDate.setMonth(eDate.getMonth() + dur);
         derivedEndDate = eDate.toISOString().split("T")[0];
      }

      let derivedNextRentDate = nextRentDate;
      const firstUnpaid = generatedCycles.find(c => !c.receivedFromTenant);
      if (firstUnpaid) {
         derivedNextRentDate = firstUnpaid.dueDate;
      }

      let calculatedStatus = newPropStatus;
      if (derivedNextRentDate && new Date(derivedNextRentDate) < new Date() && calculatedStatus === "نشط") {
        calculatedStatus = "متأخر";
      } else if (derivedNextRentDate && new Date(derivedNextRentDate) >= new Date() && calculatedStatus === "متأخر") {
        calculatedStatus = "نشط";
      }

      const totalCyclesAmount = generatedCycles.reduce((acc, c) => acc + c.amount, 0);

      const propertyData: PropertyData = {
        id: editingId || Date.now(),
        clientId: clientId,
        type: newPropType,
        name: newPropName,
        location: newPropLocation,
        tenant: newPropTenant || "غير محدد",
        status: calculatedStatus,
        paymentFreq: newPropFreq,
        revenue: totalCyclesAmount > 0 ? totalCyclesAmount : (editingId ? (properties.find(p=>p.id === editingId)?.revenue || 0) : (Number(newPropRev) || 0)),
        rentAmount: Number(newPropRentAmount),
        durationMonths: dur,
        rentCycles: generatedCycles,
        documents: uploadedFiles,
        expenses: editingId ? properties.find(p=>p.id === editingId)?.expenses || [] : [],
        issues: editingId ? properties.find(p=>p.id === editingId)?.issues || [] : [],
        startDate,
        endDate: derivedEndDate,
        nextRentDate: derivedNextRentDate,
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
            <p className="text-2xl font-extrabold text-slate-900 mt-1">د.أ {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-rose-100 text-rose-700 rounded-2xl shadow-sm"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">إجمالي المصروفات</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">د.أ {totalExpenses.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800 flex items-center gap-5">
          <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-sm"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-300">صافي التدفقات</p>
            <p className="text-2xl font-extrabold text-white mt-1">د.أ {netCashFlow.toLocaleString()}</p>
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
                  <p className="text-2xl font-black text-slate-900">د.أ {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                  <p className="text-sm font-extrabold text-rose-600 tracking-wider mb-1">إجمالي الخصومات</p>
                  <p className="text-2xl font-black text-rose-700">د.أ {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                  <p className="text-sm font-extrabold text-emerald-700 tracking-wider mb-1">الصافي المستحق للمالك</p>
                  <p className="text-2xl font-black text-emerald-700">د.أ {netCashFlow.toLocaleString()}</p>
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
                          <span className={`px-2.5 py-1 rounded-md text-xs tracking-wider ${item.type === 'إيراد' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{item.type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-slate-900">{item.desc}</td>
                        <td className={`py-3 px-4 text-left text-sm font-extrabold ${item.amount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>{item.amount < 0 ? `-د.أ ${Math.abs(item.amount)}` : `$${item.amount}`}</td>
                        <td className="py-3 px-4 text-left text-sm font-bold text-slate-500">{item.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <h4 className="text-xl font-extrabold text-slate-900 mt-10 mb-4">تفاصيل العقارات والتحصيلات</h4>
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-100/50">
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">العقار</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">قيمة العقد</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">المحصل</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">طريقة التحويل</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-slate-600 border-b border-slate-200">رقم الحوالة</th>
                    <th className="py-3 px-4 text-left text-xs font-extrabold text-slate-600 border-b border-slate-200">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientProperties.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-slate-500 font-bold">لا توجد عقارات مسجلة.</td></tr>
                  ) : (
                    clientProperties.map((p, idx) => {
                      const collected = (p.rentCycles || []).reduce((acc, c) => c.receivedFromTenant ? acc + c.amount : acc, 0);
                      const remaining = p.revenue - collected;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-bold text-slate-900">{p.name}</td>
                          <td className="py-3 px-4 text-sm font-extrabold text-indigo-700">د.أ {p.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm font-extrabold text-emerald-600">د.أ {collected.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm font-bold text-slate-600">{p.payoutMethod || "-"}</td>
                          <td className="py-3 px-4 text-sm font-bold text-slate-600">{p.payoutTransactionId || "-"}</td>
                          <td className="py-3 px-4 text-left text-sm font-extrabold text-rose-600">د.أ {remaining.toLocaleString()}</td>
                        </tr>
                      );
                    })
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
                <label className="block text-sm font-bold text-slate-800 mb-2">دورية الدفع</label>
                <select value={newPropFreq} onChange={(e) => setNewPropFreq(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>شهري - نفس يوم البداية</option>
                  <option>شهري - بداية الشهر</option>
                  <option>شهري - نهاية الشهر</option>
                  <option>ربع سنوي (كل 3 أشهر)</option>
                  <option>نصف سنوي (كل 6 أشهر)</option>
                  <option>سنوي (كل 12 شهر)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">قيمة الدفعة الواحدة (د.أ)</label>
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
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer placeholder-slate-500" />
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

          const totalExpected = prop.revenue || 0;
          const totalCollected = (prop.rentCycles || []).reduce((acc, curr) => curr.receivedFromTenant ? acc + curr.amount : acc, 0);
          const totalExpenses = (prop.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
          const remaining = Math.max(0, totalExpected - totalCollected);
          const percent = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
          const isExpanded = expandedPropId === prop.id;

          return (
          <div key={prop.id} className={`bg-white rounded-3xl shadow-sm border border-slate-200 p-4 lg:p-0 lg:bg-transparent lg:rounded-none lg:shadow-none lg:border-0 lg:border-b lg:border-slate-200 lg:last:border-0 flex flex-col justify-between group transition-colors antialiased ${isExpanded ? '' : 'hover:bg-slate-50/50'}`}>
            
            <div 
              className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2 lg:py-3 cursor-pointer ${isExpanded ? 'lg:bg-slate-50 lg:px-4 lg:-mx-4 lg:rounded-t-2xl lg:mt-2' : ''}`}
              onClick={() => setExpandedPropId(isExpanded ? null : prop.id)}
            >
               <div className="flex items-center gap-3 w-full lg:w-1/4">
                 <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shrink-0">
                   <Building className="w-5 h-5" />
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-base font-extrabold text-slate-900 truncate">{prop.name}</h3>
                   <p className="text-sm font-bold text-slate-500 truncate mt-0.5">{prop.type} • {prop.location}</p>
                 </div>
               </div>

               <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:flex-1 bg-slate-50 lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none border border-slate-100 lg:border-0 ${isExpanded ? 'hidden lg:grid' : ''}`}>
                 <div>
                   <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">المستأجر</p>
                   <p className="text-sm font-bold text-slate-800 truncate">{prop.tenant}</p>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">الاستحقاق القادم</p>
                    <p className={`text-sm font-bold ${isRentLate ? 'text-rose-600' : 'text-slate-800'}`}>
                      {prop.nextRentDate || "غير محدد"}
                      {isRentLate && <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md">متأخر</span>}
                    </p>
                 </div>
                 <div>
                   <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider">قيمة الدفعة</p>
                   <p className="text-sm font-black text-indigo-700">د.أ {prop.rentAmount?.toLocaleString() || prop.revenue?.toLocaleString()}</p>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="w-full">
                      <p className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wider block lg:hidden">الحالة</p>
                      <span className={`px-2 py-1 text-xs font-extrabold rounded-lg shadow-sm border whitespace-nowrap ${
                        prop.status === 'نشط' || prop.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        prop.status === 'متأخر' || prop.status === 'Delayed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        prop.status.includes('مسودة') || prop.status.includes('منتهي') ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        prop.status === 'محجوز' ? 'bg-slate-800 text-white border-slate-900' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                 </div>
               </div>

               <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full lg:w-auto pt-2 lg:pt-0 justify-end" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setExpandedPropId(isExpanded ? null : prop.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border ${isExpanded ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                    {isExpanded ? 'طي اللوحة' : 'إدارة العقار'}
                  </button>
               </div>
            </div>

            {isExpanded && (
               <div className="w-full lg:-mx-4 lg:w-[calc(100%+2rem)] bg-slate-50 border-t border-b border-slate-200 p-4 lg:p-6 shadow-inner relative animate-in slide-in-from-top-2 duration-300 rounded-b-3xl lg:rounded-b-2xl mb-4">
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 mb-1">إجمالي قيمة العقد</p>
                        <p className="text-lg font-black text-slate-900">د.أ {totalExpected.toLocaleString()}</p>
                     </div>
                     <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                        <p className="text-xs font-bold text-emerald-700 mb-1">تم تحصيله</p>
                        <p className="text-lg font-black text-emerald-600">د.أ {totalCollected.toLocaleString()}</p>
                     </div>
                     <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                        <p className="text-xs font-bold text-amber-700 mb-1">إجمالي المصروفات</p>
                        <p className="text-lg font-black text-amber-600">د.أ {totalExpenses.toLocaleString()}</p>
                     </div>
                     <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 mb-1">المتبقي للتحصيل</p>
                        <p className="text-lg font-black text-rose-600">د.أ {remaining.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                     <button onClick={() => openEdit(prop)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <Edit2 className="w-4 h-4" /> تعديل البيانات
                     </button>
                     <button onClick={() => setExtendingPropId(extendingPropId === prop.id ? null : prop.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                        <CalendarIcon className="w-4 h-4" /> تمديد العقد
                     </button>
                     <button onClick={() => setIncreaseRentPropId(increaseRentPropId === prop.id ? null : prop.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                        <TrendingUp className="w-4 h-4" /> زيادة الإيجار
                     </button>
                     
                     <div className="w-px h-6 bg-slate-200 mx-1 my-auto hidden md:block"></div>
                     
                     <button onClick={() => handleArchiveProperty(prop.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                        <Archive className="w-4 h-4" /> أرشفة مسودة
                     </button>
                     <button onClick={() => setConfirmAction({type: 'duplicateProperty', payload: prop})} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                        <Copy className="w-4 h-4" /> نسخ
                     </button>
                     <button onClick={() => setConfirmAction({type: 'deleteProperty', payload: prop})} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-700 hover:text-white hover:bg-rose-600 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" /> حذف
                     </button>
                     
                     {prop.documents && prop.documents.length > 0 && (
                        <button onClick={() => handleDownload(prop.documents![0].name)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors md:ml-auto">
                          <FileText className="w-4 h-4" /> المستندات
                        </button>
                     )}
                  </div>

                  {extendingPropId === prop.id && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-6 animate-in fade-in">
                      <p className="text-sm font-bold text-indigo-800 mb-2">أدخل مدة التمديد (بالأشهر):</p>
                      <div className="flex gap-2">
                        <input type="number" min="1" value={extendMonths} onChange={e => setExtendMonths(Number(e.target.value))} className="w-24 px-3 py-2 border border-indigo-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-indigo-600" />
                        <button onClick={() => handleExtendContract(prop.id)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">تنفيذ التمديد</button>
                      </div>
                    </div>
                  )}

                  {increaseRentPropId === prop.id && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-6 animate-in fade-in">
                      <p className="text-sm font-bold text-emerald-800 mb-2">زيادة قيمة الإيجار:</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex-1 min-w-[200px]">
                           <label className="text-xs font-bold text-emerald-700 mb-1 block">القيمة الجديدة للدفعة (د.أ)</label>
                           <input type="number" min="1" value={increaseRentAmount} onChange={e => setIncreaseRentAmount(e.target.value)} placeholder="مثال: 450" className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-600 placeholder-slate-400" />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                           <label className="text-xs font-bold text-emerald-700 mb-1 block">تطبق على الدفعات ابتداءً من تاريخ</label>
                           <select value={increaseRentDate} onChange={e => setIncreaseRentDate(e.target.value)} className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-emerald-600">
                             <option value="">-- اختر الدفعة --</option>
                             {prop.rentCycles?.map(c => <option key={c.id} value={c.dueDate}>دفعة {c.dueDate} (حالية: د.أ {c.amount})</option>)}
                           </select>
                        </div>
                        <div className="w-full mt-2">
                          <button onClick={() => handleIncreaseRent(prop.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">حفظ التغيير</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     
                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                           <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-indigo-600" /> جدول الدفعات والتحصيلات</h4>
                        </div>
                        <div className="p-0 overflow-x-auto max-h-96 custom-scrollbar">
                          <table className="w-full text-right border-collapse">
                            <thead className="sticky top-0 bg-slate-50">
                              <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="py-3 px-4 font-extrabold">المبلغ</th>
                                <th className="py-3 px-4 font-extrabold">الاستحقاق</th>
                                <th className="py-3 px-4 font-extrabold">التحصيل</th>
                                <th className="py-3 px-4 font-extrabold">للمالك</th>
                              </tr>
                            </thead>
                            <tbody>
                              {prop.rentCycles?.map(cycle => {
                                const isCycleLate = calculateDays(cycle.dueDate) !== null && calculateDays(cycle.dueDate)! < 0 && !cycle.receivedFromTenant;
                                return (
                                <tr key={cycle.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors ${isCycleLate ? 'bg-rose-50/30' : ''}`}>
                                  <td className="py-3 px-4 text-sm font-bold text-slate-900">د.أ {cycle.amount}</td>
                                  <td className="py-3 px-4 text-sm font-bold text-slate-600">
                                    <div className="flex items-center gap-2">
                                      {cycle.dueDate}
                                      {isCycleLate && <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-md font-extrabold">متأخر</span>}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-bold">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={cycle.receivedFromTenant} onChange={(e) => {
                                        const updated = properties.map(p => {
                                          if (p.id === prop.id) {
                                            const newCycles = p.rentCycles?.map(c => c.id === cycle.id ? {...c, receivedFromTenant: e.target.checked} : c) || [];
                                            const firstUnpaid = newCycles.find(c => !c.receivedFromTenant);
                                            const nextDate = firstUnpaid ? firstUnpaid.dueDate : p.endDate;
                                            
                                            let newStatus = p.status;
                                            if (nextDate && new Date(nextDate) < new Date() && newStatus === 'نشط') {
                                               newStatus = 'متأخر';
                                            } else if (nextDate && new Date(nextDate) >= new Date() && newStatus === 'متأخر') {
                                               newStatus = 'نشط';
                                            }
                                            
                                            return {...p, rentCycles: newCycles, nextRentDate: nextDate, status: newStatus};
                                          }
                                          return p;
                                        });
                                        setProperties(updated);
                                      }} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                                      <span className={`text-xs ${cycle.receivedFromTenant ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}`}>تم التحصيل</span>
                                    </label>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-bold">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" checked={cycle.paidToLandlord} onChange={(e) => {
                                        const updated = properties.map(p => {
                                          if (p.id === prop.id) {
                                            const newCycles = p.rentCycles?.map(c => c.id === cycle.id ? {...c, paidToLandlord: e.target.checked} : c) || [];
                                            return {...p, rentCycles: newCycles};
                                          }
                                          return p;
                                        });
                                        setProperties(updated);
                                      }} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" disabled={!cycle.receivedFromTenant} />
                                      <span className={`text-xs ${cycle.paidToLandlord ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}>محول</span>
                                    </label>
                                  </td>
                                </tr>
                              )})}
                            </tbody>
                          </table>
                        </div>
                     </div>

                     <div className="flex flex-col gap-6">
                        
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-700" /> المصروفات والخصومات</h4>
                           </div>
                           <div className="p-4">
                             <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar mb-4">
                                {(prop.expenses || []).length === 0 ? (
                                   <p className="text-sm text-slate-500 font-semibold italic">لا توجد مصروفات مسجلة.</p>
                                ) : (
                                  prop.expenses?.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">{exp.description}</p>
                                        <p className="text-xs font-semibold text-slate-400 mt-1">{exp.date}</p>
                                      </div>
                                      <p className="text-sm font-black text-rose-600">د.أ {exp.amount}</p>
                                    </div>
                                  ))
                                )}
                             </div>
                             <form onSubmit={(e) => handleAddExpense(e, prop.id)} className="flex flex-col gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                               <input type="text" value={newExpenseDesc} onChange={(e) => setNewExpenseDesc(e.target.value)} placeholder="وصف المصروف..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900" required />
                               <div className="flex gap-2">
                                 <input type="number" value={newExpenseAmt} onChange={(e) => setNewExpenseAmt(e.target.value)} placeholder="المبلغ (د.أ)" className="w-2/3 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900" required />
                                 <button type="submit" className="w-1/3 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">إضافة</button>
                               </div>
                             </form>
                           </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                           <div className="bg-amber-50 border-b border-amber-100 p-4 flex justify-between items-center">
                              <h4 className="text-sm font-extrabold text-amber-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-700" /> القضايا القانونية</h4>
                           </div>
                           <div className="p-4">
                             <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar mb-4">
                                {(prop.issues || []).length === 0 ? (
                                   <p className="text-sm text-slate-500 font-semibold italic">لا توجد قضايا أو مشاكل مسجلة.</p>
                                ) : (
                                  prop.issues?.map(issue => (
                                    <div key={issue.id} className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                                      <div>
                                        <p className="text-sm font-bold text-slate-800">{issue.description}</p>
                                        <p className="text-xs font-semibold text-slate-400 mt-1">{issue.date}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <span className={`px-2 py-1 text-[10px] font-extrabold rounded-md border ${issue.status === 'مفتوحة' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>{issue.status}</span>
                                        {issue.status === 'مفتوحة' && (
                                          <button onClick={() => {
                                            setProperties(properties.map(p => p.id === prop.id ? {...p, issues: p.issues?.map(i => i.id === issue.id ? {...i, status: 'مغلقة'} : i)} : p));
                                          }} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold hover:bg-slate-50 transition-colors">إغلاق</button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                             </div>
                             <form onSubmit={(e) => handleAddIssue(e, prop.id)} className="flex gap-2 bg-amber-50/30 p-3 rounded-xl border border-amber-100">
                               <input type="text" value={newIssueDesc} onChange={(e) => setNewIssueDesc(e.target.value)} placeholder="وصف القضية أو المشكلة..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-600" required />
                               <button type="submit" className="shrink-0 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors shadow-sm">إضافة القضية</button>
                             </form>
                           </div>
                        </div>

                     </div>
                  </div>
                  
                  <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                     <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-blue-800 flex items-center gap-2"><Send className="w-4 h-4 text-blue-600" /> إثبات تحويل صافي الإيراد للمالك</h4>
                     </div>
                     <div className="p-4">
                        {prop.payoutStatus === 'Paid to Landlord' ? (
                          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> تمت تصفية الحساب للمالك</p>
                            <p className="text-sm text-emerald-700 mt-2 font-semibold">طريقة الدفع: {prop.payoutMethod}</p>
                            {prop.payoutTransactionId && <p className="text-sm text-emerald-700 mt-1 font-semibold">رقم الحوالة/الإيصال: {prop.payoutTransactionId}</p>}
                            {prop.payoutDocument && <p className="text-sm text-emerald-700 mt-1 font-semibold">المستند: {prop.payoutDocument}</p>}
                          </div>
                        ) : (
                          <form onSubmit={(e) => handlePayoutSubmit(e, prop.id)} className="space-y-4 bg-blue-50/50 p-5 rounded-xl border border-blue-100 max-w-2xl">
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
                  </div>

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
