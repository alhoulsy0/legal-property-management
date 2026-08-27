"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building, Plus, FileText, DollarSign, MapPin, UploadCloud, User, Calendar as CalendarIcon, Clock, Edit2, TrendingUp, TrendingDown, AlertTriangle, Trash2, Download, Receipt } from "lucide-react";
import { useGlobal, PropertyData, ExpenseData } from "../../GlobalProvider";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = Number(params.id);

  const { clients, properties, setProperties } = useGlobal();

  const client = clients.find(c => c.id === clientId);
  const clientProperties = properties.filter(p => p.clientId === clientId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newPropName, setNewPropName] = useState("");
  const [newPropType, setNewPropType] = useState("Residential");
  const [newPropLocation, setNewPropLocation] = useState("");
  const [newPropTenant, setNewPropTenant] = useState("");
  const [newPropFreq, setNewPropFreq] = useState("Monthly (1st)");
  const [newPropStatus, setNewPropStatus] = useState("Active");
  const [newPropRev, setNewPropRev] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Expenses State
  const [showExpensesFor, setShowExpensesFor] = useState<number | null>(null);
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmt, setNewExpenseAmt] = useState("");

  const totalRevenue = clientProperties.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  const totalExpenses = clientProperties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + (Number(eCurr.amount) || 0), 0) || 0);
  }, 0);
  const netCashFlow = totalRevenue - totalExpenses;
  
  const activeCount = clientProperties.filter(p => p.status === 'Active').length;
  const delayedCount = clientProperties.filter(p => p.status === 'Delayed' || p.status === 'Litigation').length;

  const openAdd = () => {
    setEditingId(null);
    setNewPropName(""); setNewPropType("Residential"); setNewPropLocation(""); setNewPropTenant(""); setNewPropFreq("Monthly (1st)"); setNewPropStatus("Active"); setNewPropRev(""); setUploadedFiles([]);
    setIsAdding(true);
  };

  const openEdit = (prop: PropertyData) => {
    setEditingId(prop.id);
    setNewPropName(prop.name); setNewPropType(prop.type); setNewPropLocation(prop.location); setNewPropTenant(prop.tenant !== "N/A" ? prop.tenant : ""); setNewPropFreq(prop.paymentFreq); setNewPropStatus(prop.status); setNewPropRev(prop.revenue.toString()); setUploadedFiles(prop.documents || []);
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const handleDeleteProperty = () => {
    if (editingId && window.confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter(p => p.id !== editingId));
      setIsAdding(false);
    }
  };

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropName && newPropLocation) {
      const propertyData: PropertyData = {
        id: editingId || Date.now(),
        clientId: clientId,
        type: newPropType,
        name: newPropName,
        location: newPropLocation,
        tenant: newPropTenant || "N/A",
        status: newPropStatus,
        paymentFreq: newPropFreq,
        revenue: Number(newPropRev) || 0,
        documents: uploadedFiles,
        expenses: editingId ? properties.find(p=>p.id === editingId)?.expenses || [] : []
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
    // Simulated Download
    const blob = new Blob(["Simulated document content for " + docName], { type: "text/plain" });
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

  if (!client) {
    return <div className="p-10 text-center font-bold text-slate-500">Client not found. <Link href="/clients" className="text-blue-600 underline">Go back</Link></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/clients" className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-900 border border-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {client.name}'s Portfolio
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">Manage assets, contracts, and expenses for this client</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-md"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">Expected Total</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-rose-100 text-rose-700 rounded-2xl shadow-sm"><TrendingDown className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">Total Expenses</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">${totalExpenses.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800 flex items-center gap-5">
          <div className="p-4 bg-slate-800 text-white rounded-2xl shadow-sm"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-300">Net Cash Flow</p>
            <p className="text-2xl font-extrabold text-white mt-1">${netCashFlow.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 bg-amber-100 text-amber-700 rounded-2xl shadow-sm"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-bold text-slate-500">Delayed / Issues</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{delayedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Registered Properties</h2>
        </div>
        <button onClick={openAdd} className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition-colors font-bold flex items-center space-x-2 text-sm">
          <Plus className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 mb-6 relative overflow-hidden">
          <h3 className="text-2xl font-extrabold mb-6 text-slate-900 border-b border-slate-100 pb-4">{editingId ? 'Edit Property' : 'Register New Property'}</h3>
          <form onSubmit={handleSaveProperty} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-bold text-slate-800 mb-2">Property Name</label>
                <input type="text" value={newPropName} onChange={(e) => setNewPropName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" required placeholder="Sunset Apts" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Property Type</label>
                <select value={newPropType} onChange={(e) => setNewPropType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>Residential</option><option>Commercial</option><option>Industrial</option><option>Land</option>
                </select>
              </div>
              <div className="col-span-full lg:col-span-1">
                <label className="block text-sm font-bold text-slate-800 mb-2">Location / Address</label>
                <input type="text" value={newPropLocation} onChange={(e) => setNewPropLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" required placeholder="123 Main St" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Tenant Name (Optional)</label>
                <input type="text" value={newPropTenant} onChange={(e) => setNewPropTenant(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Payment Terms</label>
                <select value={newPropFreq} onChange={(e) => setNewPropFreq(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                  <option>Monthly (1st)</option><option>Monthly (15th)</option><option>Monthly (End of Month)</option><option>Quarterly</option><option>Yearly</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Expected Rent ($)</label>
                  <input type="number" value={newPropRev} onChange={(e) => setNewPropRev(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900 placeholder-slate-500" placeholder="0" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Status</label>
                  <select value={newPropStatus} onChange={(e) => setNewPropStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all text-sm font-semibold text-slate-900">
                    <option>Active</option><option>Delayed</option><option>Litigation</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-bold text-slate-800 mb-2">Attach Documents (Contracts, Leases)</label>
                <div className="relative w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group">
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-blue-600 mb-3 transition-colors" />
                  <p className="text-sm font-extrabold text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs font-semibold text-slate-500 mt-1">PDF, DOCX up to 10MB</p>
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

            <div className="flex space-x-3 pt-6 border-t border-slate-200">
              <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 font-bold text-sm transition-colors shadow-md">
                {editingId ? 'Save Changes' : 'Save Property'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm">
                Cancel
              </button>
              {editingId && (
                <button type="button" onClick={handleDeleteProperty} className="ml-auto bg-rose-50 text-rose-700 border border-rose-200 px-5 py-3 rounded-xl hover:bg-rose-100 font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Delete
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {clientProperties.map((prop) => (
          <div key={prop.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <Building className="w-6 h-6 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 leading-tight">{prop.name}</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{prop.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(prop)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className={`px-3 py-1.5 text-xs font-extrabold rounded-xl shadow-sm border ${
                    prop.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    prop.status === 'Delayed' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {prop.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <p className="text-slate-700 font-bold text-sm flex items-center gap-3"><MapPin className="w-5 h-5 text-slate-400 shrink-0" />{prop.location}</p>
                <p className="text-slate-700 font-bold text-sm flex items-center gap-3"><User className="w-5 h-5 text-slate-400 shrink-0" />{prop.tenant}</p>
                <p className="text-slate-700 font-bold text-sm flex items-center gap-3"><CalendarIcon className="w-5 h-5 text-slate-400 shrink-0" />Due: {prop.paymentFreq}</p>
              </div>

              {/* Documents Quick View */}
              {prop.documents && prop.documents.length > 0 && (
                <div className="mt-5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Attached Documents</p>
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
            
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-end">
              <div className="flex space-x-3">
                <button onClick={() => setShowExpensesFor(showExpensesFor === prop.id ? null : prop.id)} className={`px-4 py-2.5 rounded-xl transition-colors text-sm font-extrabold flex items-center gap-2 border shadow-sm ${showExpensesFor === prop.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'}`}>
                  <Receipt className="w-4 h-4" /> Expenses
                  {prop.expenses && prop.expenses.length > 0 && (
                    <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm ${showExpensesFor === prop.id ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>{prop.expenses.length}</span>
                  )}
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Expected Rent</p>
                <div className="text-2xl font-black text-slate-900">${prop.revenue.toLocaleString()}</div>
              </div>
            </div>

            {/* Expenses Drawer */}
            {showExpensesFor === prop.id && (
              <div className="mt-5 border-t border-slate-200 pt-5 animate-in slide-in-from-top-2 duration-300">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2"><Receipt className="w-4 h-4 text-slate-500" /> Property Expenses</h4>
                
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto custom-scrollbar">
                  {(prop.expenses || []).length === 0 ? (
                     <p className="text-sm text-slate-500 font-semibold italic">No expenses logged yet.</p>
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

                <form onSubmit={(e) => handleAddExpense(e, prop.id)} className="flex gap-3">
                  <input type="text" placeholder="Expense description..." value={newExpenseDesc} onChange={(e) => setNewExpenseDesc(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <input type="number" placeholder="$ Amt" value={newExpenseAmt} onChange={(e) => setNewExpenseAmt(e.target.value)} className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-sm shadow-sm whitespace-nowrap">Add</button>
                </form>
              </div>
            )}
          </div>
        ))}
        {clientProperties.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center text-slate-500">
            <Building className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-xl font-extrabold text-slate-700">No properties found</p>
            <p className="text-sm font-semibold mt-2 text-slate-500">Register a new property for {client.name} to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
