"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ClientData = {
  id: number;
  name: string;
  phone: string;
  properties: number;
  status: string;
};

export type ExpenseData = {
  id: number;
  description: string;
  amount: number;
  date: string;
  documentName?: string;
};

export type PropertyData = {
  id: number;
  clientId: number;
  type: string;
  name: string;
  location: string;
  tenant: string;
  status: string;
  paymentFreq: string;
  revenue: number;
  documents: any[];
  expenses: ExpenseData[];
};

type GlobalContextType = {
  clients: ClientData[];
  setClients: React.Dispatch<React.SetStateAction<ClientData[]>>;
  properties: PropertyData[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyData[]>>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with some mock data if empty, and try to use localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("legalprop_clients");
    const savedProps = localStorage.getItem("legalprop_properties");
    
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients([
        { id: 1, name: "Acme Corp", phone: "+962 7 9123 4567", properties: 2, status: "Active" },
        { id: 2, name: "Global Real Estate", phone: "+962 7 8123 4567", properties: 0, status: "Active" },
      ]);
    }
    
    if (savedProps) {
      setProperties(JSON.parse(savedProps));
    } else {
      setProperties([
        { id: 1, clientId: 1, type: "Residential", name: "Sunset Apartments", location: "Amman, 1st Circle", tenant: "Ahmad Ali", status: "Active", paymentFreq: "Monthly (1st)", revenue: 500, documents: [{ name: "lease_agreement.pdf", size: 1024000 }], expenses: [{ id: 1, description: "Plumbing repair", amount: 150, date: "2023-10-01", documentName: "receipt_plumbing.pdf" }] },
        { id: 2, clientId: 1, type: "Commercial", name: "Downtown Office", location: "Amman, Boulevard", tenant: "TechCorp", status: "Delayed", paymentFreq: "Yearly", revenue: 15000, documents: [], expenses: [] },
      ]);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("legalprop_clients", JSON.stringify(clients));
      localStorage.setItem("legalprop_properties", JSON.stringify(properties));
    }
  }, [clients, properties, isLoaded]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <GlobalContext.Provider value={{ clients, setClients, properties, setProperties }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
}
