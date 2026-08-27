"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Building, Plus, FileText, DollarSign, MapPin, UploadCloud, User, Calendar as CalendarIcon, Clock, Edit2, TrendingUp, TrendingDown, AlertTriangle, Trash2, Download, Receipt, Send, CheckCircle2, FileBarChart } from "lucide-react";
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
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nextRentDate, setNextRentDate] = useState("");

  const [showExpensesFor, setShowExpensesFor] = useState<number | null>(null);
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmt, setNewExpenseAmt] = useState("");

  const [showPayoutFor, setShowPayoutFor] = useState<number | null>(null);
  const [payoutMethod, setPayoutMethod] = useState("تحويل بنكي");
  const [txId, setTxId] = useState("");
  const [payoutDocName, setPayoutDocName] = useState("");

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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.addFont("Cairo-Regular.ttf", "Cairo", "normal");
    // jsPDF doesn't natively support Arabic RTL well without plugins, but we'll try basic rendering or English fallback for numbers.
    doc.setFontSize(20);
    doc.text(`Financial Statement: ${client?.name}`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Total Expected Income: $${totalRevenue}`, 14, 40);
    doc.text(`Total Deductions: $${totalExpenses}`, 14, 46);
    doc.text(`Net Cash Flow (Due to Landlord): $${netCashFlow}`, 14, 52);

    const tableColumn = ["Date", "Type", "Description", "Amount ($)", "Status"];
    const tableRows = ledgerData.map(item => [
      item.date,
      item.type,
      item.desc,
      item.amount.toString(),
      item.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 10, font: "helvetica" },
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`${client?.name}_Financial_Report.pdf`);
  };
  
  const activeCount = clientProperties.filter(p => p.status === 'Active' || p.status === 'نشط').length;
  const delayedCount = clientProperties.filter(p => p.status === 'Delayed' || p.status === 'متأخر' || p.status === 'قضية').length;

  const openAdd = () => {
    setEditingId(null);
    setNewPropName(""); setNewPropType("سكني"); setNewPropLocation(""); setNewPropTenant(""); setNewPropFreq("شهري (الأول من الشهر)"); setNewPropStatus("نشط"); setNewPropRev(""); setUploadedFiles([]);
    setStartDate(""); setEndDate(""); setNextRentDate("");
    setIsAdding(true);
  };

  const openEdit = (prop: PropertyData) => {
    setEditingId(prop.id);
    setNewPropName(prop.name); setNewPropType(prop.type); setNewPropLocation(prop.location); setNewPropTenant(prop.tenant !== "N/A" ? prop.tenant : ""); setNewPropFreq(prop.paymentFreq); setNewPropStatus(prop.status); setNewPropRev(prop.revenue.toString()); setUploadedFiles(prop.documents || []);
    setStartDate(prop.startDate || ""); setEndDate(prop.endDate || ""); setNextRentDate(prop.nextRentDate || "");
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDeleteProperty = () => {
    if (editingId && window.confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      setProperties(properties.filter(p => p.id !== editingId));
      setIsAdding(false);
    }
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropName && newPropLocation) {
      let calculatedStatus = newPropStatus;
      if (nextRentDate && new Date(nextRentDate) < new Date() && calculatedStatus === "نشط") {
        calculatedStatus = "متأخر";
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
        revenue: Number(newPropRev) || 0,
        documents: uploadedFiles,
        expenses: editingId ? properties.find(p=>p.id === editingId)?.expenses || [] : [],
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
                <label className="block text-sm font-bold text-slate-800 mb-2">قيمة الإيجار المتوقعة ($)</label>
                <input type="number" value={newPropRev} onChange={(e) => setNewPropRev(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">الحالة القانونية</label>
                <select value={newPropStatus} onChange={(e) => setNewPropStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>نشط</option><option>متأخر</option><option>قضية منظورة</option>
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
                <button type="button" onClick={handleDeleteProperty} className="mr-auto bg-rose-50 text-rose-700 border border-rose-200 px-5 py-3 rounded-xl hover:bg-rose-100 font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> حذف
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {clientProperties.map((prop) => {
          const rentDaysLeft = calculateDays(prop.nextRentDate || "");
          const contractDaysLeft = calculateDays(prop.endDate || "");
          const isRentLate = rentDaysLeft !== null && rentDaysLeft < 0;

          return (
          <div key={prop.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <Building className="w-6 h-6 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{prop.name}</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md tracking-wider">{prop.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(prop)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-1.5 text-xs font-extrabold rounded-xl shadow-sm border ${
                    prop.status === 'نشط' || prop.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    prop.status === 'متأخر' || prop.status === 'Delayed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {prop.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <p className="text-slate-700 font-bold text-sm flex items-center gap-3"><MapPin className="w-5 h-5 text-slate-400 shrink-0" />{prop.location}</p>
                <p className="text-slate-700 font-bold text-sm flex items-center gap-3"><User className="w-5 h-5 text-slate-400 shrink-0" />{prop.tenant}</p>
              </div>

              {/* Prominent Dates & Counters */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <CalendarIcon className="absolute -left-4 -bottom-4 w-16 h-16 text-slate-200 opacity-50" />
                  <p className="text-xs font-extrabold text-slate-500 tracking-wider mb-1 z-10">نهاية العقد</p>
                  <p className="text-sm font-bold text-slate-900 z-10 mb-2">{prop.endDate || "غير محدد"}</p>
                  {prop.endDate && contractDaysLeft !== null && (
                    <span className={`z-10 inline-flex w-max px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm ${contractDaysLeft < 30 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                      {contractDaysLeft < 0 ? 'منتهي الصلاحية' : `متبقي ${contractDaysLeft} يوم`}
                    </span>
                  )}
                </div>

                <div className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-center relative overflow-hidden ${isRentLate ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <Clock className={`absolute -left-4 -bottom-4 w-16 h-16 opacity-20 ${isRentLate ? 'text-rose-600' : 'text-emerald-600'}`} />
                  <p className={`text-xs font-extrabold tracking-wider mb-1 z-10 ${isRentLate ? 'text-rose-700' : 'text-emerald-700'}`}>الإيجار القادم</p>
                  <p className="text-sm font-bold text-slate-900 z-10 mb-2">{prop.nextRentDate || "غير محدد"}</p>
                  {prop.nextRentDate && rentDaysLeft !== null && (
                    <span className={`z-10 inline-flex w-max px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-sm ${isRentLate ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      {isRentLate ? `متأخر ${Math.abs(rentDaysLeft)} يوم` : `يستحق بعد ${rentDaysLeft} يوم`}
                    </span>
                  )}
                </div>
              </div>

              {prop.documents && prop.documents.length > 0 && (
                <div className="mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 tracking-wider mb-3">المستندات المرفقة</p>
                  <div className="space-y-2">
                    {prop.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-sm font-bold text-slate-700 truncate">{doc.name}</span>
                        </div>
                        <button onClick={() => handleDownload(doc.name)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button onClick={() => {setShowExpensesFor(showExpensesFor === prop.id ? null : prop.id); setShowPayoutFor(null);}} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-colors text-sm font-extrabold flex items-center justify-center gap-2 border shadow-sm ${showExpensesFor === prop.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'}`}>
                  <Receipt className="w-4 h-4" /> إضافة مصروف
                </button>
                <button onClick={() => {setShowPayoutFor(showPayoutFor === prop.id ? null : prop.id); setShowExpensesFor(null);}} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-colors text-sm font-extrabold flex items-center justify-center gap-2 border shadow-sm ${showPayoutFor === prop.id ? 'bg-blue-600 text-white border-blue-600' : prop.payoutStatus === 'Paid to Landlord' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'}`}>
                  {prop.payoutStatus === 'Paid to Landlord' ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />} 
                  تحويل للمالك
                </button>
              </div>
              <div className="text-left w-full sm:w-auto mt-2 sm:mt-0">
                <p className="text-xs font-extrabold text-slate-500 tracking-wider mb-1">الإيجار المتوقع</p>
                <div className="text-2xl font-black text-slate-900">${prop.revenue.toLocaleString()}</div>
              </div>

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
  );
}
