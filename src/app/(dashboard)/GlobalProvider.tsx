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

export type RentCycle = {
  id: string;
  dueDate: string;
  amount: number;
  receivedFromTenant: boolean;
  paidToLandlord: boolean;
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
  rentAmount?: number;
  durationMonths?: number;
  rentCycles?: RentCycle[];
  revenue: number;
  documents?: any[];
  expenses?: ExpenseData[];
  issues?: { id: number; description: string; date: string; status: string }[];
  startDate?: string;
  endDate?: string;
  nextRentDate?: string;
  payoutStatus?: string;
  payoutMethod?: string;
  payoutTransactionId?: string;
  payoutDocument?: string;
};

export interface TaskData {
  id: number;
  text: string;
  done: boolean;
}

type GlobalContextType = {
  clients: ClientData[];
  setClients: React.Dispatch<React.SetStateAction<ClientData[]>>;
  properties: PropertyData[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyData[]>>;
  tasks: TaskData[];
  setTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with some mock data if empty, and try to use localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("legalprop_clients");
    const savedProps = localStorage.getItem("legalprop_properties");
    const savedTasks = localStorage.getItem("legalprop_tasks");
    
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

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, text: "مراجعة ملفات المستأجر الجديد", done: false },
        { id: 2, text: "توقيع عقد عمارة الياسمين", done: false },
        { id: 3, text: "متابعة صيانة الشقة رقم 4", done: false },
        { id: 4, text: "إرسال إشعار تأخير دفع للمستأجر", done: false }
      ]);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("legalprop_clients", JSON.stringify(clients));
      localStorage.setItem("legalprop_properties", JSON.stringify(properties));
      localStorage.setItem("legalprop_tasks", JSON.stringify(tasks));
    }
  }, [clients, properties, tasks, isLoaded]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <GlobalContext.Provider value={{ clients, setClients, properties, setProperties, tasks, setTasks }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
}
