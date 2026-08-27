"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Plus, Building, ChevronLeft, Search, Phone, Edit2, Trash2 } from "lucide-react";
import { useGlobal } from "../GlobalProvider";
import { useRouter } from "next/navigation";

export default function ClientsPage() {
  const { clients, setClients, properties, setProperties } = useGlobal();
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const openAdd = () => {
    setEditingId(null);
    setClientName("");
    setClientPhone("");
    setIsAdding(true);
  };

  const openEdit = (client: any) => {
    setEditingId(client.id);
    setClientName(client.name);
    setClientPhone(client.phone);
    setIsAdding(true);
  };

  const handleDeleteClient = () => {
    if (editingId && window.confirm("هل أنت متأكد من حذف هذا الموكل؟ سيتم حذف جميع العقارات الخاصة به.")) {
      setClients(clients.filter(c => c.id !== editingId));
      setProperties(properties.filter(p => p.clientId !== editingId));
      setIsAdding(false);
    }
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName) {
      if (editingId) {
        setClients(clients.map(c => c.id === editingId ? { ...c, name: clientName, phone: clientPhone } : c));
      } else {
        setClients([...clients, { id: Date.now(), name: clientName, phone: clientPhone, properties: 0, status: "Active" }]);
      }
      setIsAdding(false);
    }
  };

  const translateStatus = (status: string) => {
    if (status === "Active") return "نشط";
    return status;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">سجل الموكلين</h1>
          <p className="text-slate-600 mt-1 text-sm font-bold">إدارة بيانات الملاك والموكلين وعقاراتهم</p>
        </div>
        <button onClick={openAdd} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm">
          <Plus className="w-5 h-5" />
          <span>إضافة موكل جديد</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-6 relative overflow-hidden">
          <h2 className="text-xl font-extrabold mb-5 text-slate-900">{editingId ? 'تعديل بيانات الموكل' : 'تسجيل موكل جديد'}</h2>
          <form onSubmit={handleSaveClient} className="space-y-5 max-w-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">اسم الموكل</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-semibold text-slate-900 placeholder-slate-500 text-sm" required placeholder="مثال: شركة الأفق" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">رقم الهاتف</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-semibold text-slate-900 placeholder-slate-500 text-sm" placeholder="0790000000" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-bold text-sm transition-colors shadow-md">
                {editingId ? 'حفظ التعديلات' : 'حفظ الموكل'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm">
                إلغاء
              </button>
              {editingId && (
                <button type="button" onClick={handleDeleteClient} className="mr-auto bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2.5 rounded-xl hover:bg-rose-100 font-bold text-sm transition-colors shadow-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> حذف
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-80">
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="بحث عن موكل..." className="w-full pr-11 pl-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-right">
            <thead className="bg-slate-100/50">
              <tr>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">تفاصيل الموكل</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">رقم الهاتف</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">المحفظة العقارية</th>
                <th className="px-6 py-4 text-xs font-extrabold text-slate-700 uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-700 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients.map((client) => {
                const clientPropsCount = properties.filter(p => p.clientId === client.id).length;
                return (
                <tr key={client.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md">{client.name.charAt(0)}</div>
                      <div><div className="text-sm font-extrabold text-slate-900">{client.name}</div></div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm text-slate-700 font-bold flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" />{client.phone}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-xs font-extrabold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg w-max shadow-sm"><Building className="h-4 w-4 ml-1.5 text-blue-600" />{clientPropsCount} عقارات</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1.5 inline-flex text-xs font-extrabold rounded-lg bg-emerald-100 text-emerald-800 shadow-sm">{translateStatus(client.status)}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-left text-sm font-bold flex justify-end gap-3">
                    <button onClick={() => openEdit(client)} className="p-2.5 text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-blue-100 rounded-xl transition-colors shadow-sm"><Edit2 className="w-4 h-4" /></button>
                    <Link href={`/clients/${client.id}`} className="inline-flex items-center text-white bg-slate-900 hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                      عرض التفاصيل <ChevronLeft className="w-4 h-4 mr-1.5" />
                    </Link>
                  </td>
                </tr>
              )})}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500 font-bold text-lg">لم يتم إضافة موكلين بعد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
