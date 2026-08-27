"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building, Plus, FileText, DollarSign, Activity, MapPin } from "lucide-react";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id;

  const [properties, setProperties] = useState([
    { id: 1, name: "Sunset Apartments", location: "123 Sunset Blvd", status: "active", revenue: 5000 },
    { id: 2, name: "Downtown Office Plaza", location: "456 Main St", status: "delayed", revenue: 10000 },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newPropName, setNewPropName] = useState("");
  const [newPropLocation, setNewPropLocation] = useState("");

  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPropName && newPropLocation) {
      setProperties([...properties, {
        id: properties.length + 1,
        name: newPropName,
        location: newPropLocation,
        status: "active",
        revenue: 0
      }]);
      setIsAdding(false);
      setNewPropName("");
      setNewPropLocation("");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/clients" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-500 hover:text-gray-900 border border-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Client Portfolio 
            <span className="text-xl font-medium bg-gray-100 px-3 py-1 rounded-lg text-gray-500 border border-gray-200">ID: {clientId}</span>
          </h1>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Registered Properties</h2>
          <p className="text-gray-500 font-medium mt-1">Manage assets and linked contracts</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-gray-800 transition-all font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Property</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-sm border border-indigo-100 mb-6 relative overflow-hidden">
          <h3 className="text-xl font-bold mb-5 text-indigo-900">Register New Property</h3>
          <form onSubmit={handleAddProperty} className="space-y-5 max-w-xl">
            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-1.5">Property Name</label>
              <input
                type="text"
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-indigo-900 mb-1.5">Location / Address</label>
              <input
                type="text"
                value={newPropLocation}
                onChange={(e) => setNewPropLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                required
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-semibold transition-colors shadow-md"
              >
                Save Property
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-white/50 text-indigo-900 border border-indigo-200 px-6 py-2.5 rounded-xl hover:bg-white font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 opacity-30 ${
                prop.status === 'active' ? 'bg-emerald-400' :
                prop.status === 'delayed' ? 'bg-amber-400' : 'bg-rose-400'
            }`}></div>
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform">
                  <Building className="w-6 h-6 text-gray-700" />
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize shadow-sm ${
                  prop.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  prop.status === 'delayed' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {prop.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{prop.name}</h3>
              <p className="text-gray-500 font-medium text-sm flex items-start gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                {prop.location}
              </p>
            </div>
            
            <div className="mt-8 pt-5 border-t border-gray-100 flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors tooltip relative group/btn">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="p-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors">
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Monthly Rev</p>
                <div className="text-lg font-extrabold text-gray-900">
                  ${prop.revenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && !isAdding && (
          <div className="col-span-full py-16 bg-gray-50/50 border border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center text-gray-500">
            <Building className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-semibold text-lg text-gray-600">No properties found</p>
            <p className="text-sm mt-1">Register a new property to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
