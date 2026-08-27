"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building, Plus, FileText, DollarSign } from "lucide-react";

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id;

  // Mock data
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/clients" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Client Profile: {clientId}</h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Associated Properties</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-bold mb-4">Register New Property</h3>
          <form onSubmit={handleAddProperty} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property Name</label>
              <input
                type="text"
                value={newPropName}
                onChange={(e) => setNewPropName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={newPropLocation}
                onChange={(e) => setNewPropLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Save Property
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-gray-500" />
                  <span>{prop.name}</span>
                </h3>
                <p className="text-gray-500 mt-1">{prop.location}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                prop.status === 'active' ? 'bg-green-100 text-green-800' :
                prop.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {prop.status}
              </span>
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center">
              <div className="flex space-x-4">
                <button className="text-sm text-blue-600 flex items-center space-x-1 hover:underline">
                  <FileText className="w-4 h-4" />
                  <span>Contracts</span>
                </button>
                <button className="text-sm text-blue-600 flex items-center space-x-1 hover:underline">
                  <DollarSign className="w-4 h-4" />
                  <span>Expenses</span>
                </button>
              </div>
              <div className="text-sm font-medium text-gray-700">
                Rev: ${prop.revenue.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && !isAdding && (
          <p className="text-gray-500 col-span-2">No properties registered for this client.</p>
        )}
      </div>
    </div>
  );
}
