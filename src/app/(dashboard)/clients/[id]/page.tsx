"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building, Plus, FileText, DollarSign, MapPin, UploadCloud, User, Calendar as CalendarIcon, Clock, Edit2, TrendingUp, AlertTriangle } from "lucide-react";
import { useGlobal, PropertyData } from "../../GlobalProvider";

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

  // Mini-dashboard metrics
  const totalRevenue = clientProperties.reduce((acc, curr) => acc + curr.revenue, 0);
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
      // Just mock storing file metadata
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
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
        documents: uploadedFiles
      };

      if (editingId) {
        setProperties(properties.map(p => p.id === editingId ? propertyData : p));
      } else {
        setProperties([...properties, propertyData]);
      }
      setIsAdding(false);
    }
  };

  if (!client) {
    return <div className="p-10 text-center text-slate-500">Client not found. <Link href="/clients" className="text-blue-600 underline">Go back</Link></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/clients" className="p-2 bg-white rounded-lg shadow-sm hover:shadow transition-all text-slate-500 hover:text-slate-900 border border-slate-200">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            {client.name}'s Portfolio
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage assets and contracts for this client</p>
        </div>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Expected Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Active Properties</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Issues / Delayed</p>
            <p className="text-2xl font-bold text-rose-600">{delayedCount}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Registered Properties</h2>
        </div>
        <button onClick={openAdd} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-sm hover:bg-slate-800 transition-colors font-semibold flex items-center space-x-2 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 mb-6 relative overflow-hidden">
          <h3 className="text-lg font-bold mb-5 text-slate-900 border-b pb-3">{editingId ? 'Edit Property' : 'Register New Property'}</h3>
          <form onSubmit={handleSaveProperty} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="col-span-full md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Property Name</label>
                <input type="text" value={newPropName} onChange={(e) => setNewPropName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Property Type</label>
                <select value={newPropType} onChange={(e) => setNewPropType(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium">
                  <option>Residential</option><option>Commercial</option><option>Industrial</option><option>Land</option>
                </select>
              </div>
              <div className="col-span-full lg:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location / Address</label>
                <input type="text" value={newPropLocation} onChange={(e) => setNewPropLocation(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tenant Name (Optional)</label>
                <input type="text" value={newPropTenant} onChange={(e) => setNewPropTenant(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Terms</label>
                <select value={newPropFreq} onChange={(e) => setNewPropFreq(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium">
                  <option>Monthly (1st)</option><option>Monthly (15th)</option><option>Monthly (End of Month)</option><option>Quarterly</option><option>Yearly</option>
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expected Rent ($)</label>
                  <input type="number" value={newPropRev} onChange={(e) => setNewPropRev(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select value={newPropStatus} onChange={(e) => setNewPropStatus(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium">
                    <option>Active</option><option>Delayed</option><option>Litigation</option>
                  </select>
                </div>
              </div>

              {/* Document Upload Area */}
              <div className="col-span-full">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Attach Documents (Contracts, Leases)</label>
                <div className="relative w-full border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                  <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 10MB</p>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate flex-1">{file.name}</span>
                        <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-slate-100">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors shadow-sm">
                {editingId ? 'Save Changes' : 'Save Property'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-700 border border-slate-200 px-6 py-2 rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {clientProperties.map((prop) => (
          <div key={prop.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                    <Building className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{prop.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{prop.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(prop)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md shadow-sm ${
                    prop.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    prop.status === 'Delayed' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {prop.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <p className="text-slate-600 font-medium text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400 shrink-0" />{prop.location}</p>
                <p className="text-slate-600 font-medium text-sm flex items-center gap-2"><User className="w-4 h-4 text-slate-400 shrink-0" />{prop.tenant}</p>
                <p className="text-slate-600 font-medium text-sm flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />Due: {prop.paymentFreq}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-end">
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 border border-slate-200 relative">
                  <FileText className="w-3.5 h-3.5" /> Docs
                  {prop.documents && prop.documents.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{prop.documents.length}</span>
                  )}
                </button>
                <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 border border-slate-200">
                  <Clock className="w-3.5 h-3.5" /> History
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Expected Rent</p>
                <div className="text-xl font-extrabold text-slate-900">${prop.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
        {clientProperties.length === 0 && !isAdding && (
          <div className="col-span-full py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500">
            <Building className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-bold text-slate-600">No properties found</p>
            <p className="text-sm font-medium mt-1">Register a new property for {client.name} to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
