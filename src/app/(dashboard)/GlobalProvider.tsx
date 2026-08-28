"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ClientData = {
  id: number;
  name: string;
  phone: string;
  properties: number;
  status: string;
  nationalId?: string; // الرقم الوطني للأردنيين
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

// Jordanian Case Management System Types
export type WakalaData = {
  id: string;
  clientId: number;
  wakalaNumber: string;
  notaryPublicName: string; // كاتب العدل
  type: "عامة" | "خاصة" | "جزئية";
  issueDate: string;
  status: "Active" | "Revoked";
  documentPath?: string;
};

export type LegalCaseData = {
  id: string;
  clientId: number;
  caseNumber: string; // رقم الدعوى
  year: number;
  courtName: "محكمة الصلح" | "محكمة البداية" | "محكمة الاستئناف" | "محكمة التمييز" | "محكمة شرعية" | "أخرى";
  caseType: "حقوقي" | "جزائي" | "شرعي";
  status: string; // مفتوحة، مغلقة، قيد الاستئناف، حكم فاصِل...
  claimAmount: number;
  judgment_date?: string;
  appeal_deadline?: string;
};

export type HearingData = {
  id: string;
  caseId: string;
  sessionDate: string;
  judicialPanel?: string; // الهيئة القضائية
  notes?: string;
  nextSessionDate?: string;
  requiredActions?: string;
};

export type LegalFinancialData = {
  id: string;
  caseId: string;
  type: "رسوم محاكم" | "أتعاب محاماة" | "أتعاب خبرة" | "طوابع" | "أخرى";
  amount: number;
  date: string;
};

type GlobalContextType = {
  clients: ClientData[];
  setClients: React.Dispatch<React.SetStateAction<ClientData[]>>;
  properties: PropertyData[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyData[]>>;
  tasks: TaskData[];
  setTasks: React.Dispatch<React.SetStateAction<TaskData[]>>;
  
  // Case Management State Context
  wakalas: WakalaData[];
  setWakalas: React.Dispatch<React.SetStateAction<WakalaData[]>>;
  cases: LegalCaseData[];
  setCases: React.Dispatch<React.SetStateAction<LegalCaseData[]>>;
  hearings: HearingData[];
  setHearings: React.Dispatch<React.SetStateAction<HearingData[]>>;
  legalFinancials: LegalFinancialData[];
  setLegalFinancials: React.Dispatch<React.SetStateAction<LegalFinancialData[]>>;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  
  // Case Management States
  const [wakalas, setWakalas] = useState<WakalaData[]>([]);
  const [cases, setCases] = useState<LegalCaseData[]>([]);
  const [hearings, setHearings] = useState<HearingData[]>([]);
  const [legalFinancials, setLegalFinancials] = useState<LegalFinancialData[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize with mock data or localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("legalprop_clients");
    const savedProps = localStorage.getItem("legalprop_properties");
    const savedTasks = localStorage.getItem("legalprop_tasks");
    const savedWakalas = localStorage.getItem("legalprop_wakalas");
    const savedCases = localStorage.getItem("legalprop_cases");
    const savedHearings = localStorage.getItem("legalprop_hearings");
    const savedFinancials = localStorage.getItem("legalprop_legalFinancials");
    
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients([
        { id: 1, name: "شركة الأفق للاستيراد والتصدير", phone: "+962 7 9123 4567", properties: 2, status: "Active", nationalId: "2000123456" },
        { id: 2, name: "شركة تطوير العقار العالمية", phone: "+962 7 8123 4567", properties: 0, status: "Active", nationalId: "2000987654" },
      ]);
    }
    
    if (savedProps) {
      setProperties(JSON.parse(savedProps));
    } else {
      setProperties([
        { id: 1, clientId: 1, type: "سكني", name: "شقة ضاحية الرشيد", location: "عمان، ضاحية الرشيد", tenant: "أحمد علي", status: "نشط", paymentFreq: "شهري - نفس يوم البداية", revenue: 500, documents: [{ name: "lease_agreement.pdf", size: 1024000 }], expenses: [{ id: 1, description: "صيانة صحية", amount: 150, date: "2026-08-01", documentName: "receipt_plumbing.pdf" }] },
        { id: 2, clientId: 1, type: "تجاري", name: "مخزن عبدون التجاري", location: "عمان، عبدون", tenant: "شركة البرمجيات الحديثة", status: "متأخر", paymentFreq: "سنوي", revenue: 15000, documents: [], expenses: [] },
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

    // Load Wakalas
    if (savedWakalas) {
      setWakalas(JSON.parse(savedWakalas));
    } else {
      setWakalas([
        { id: "w-1", clientId: 1, wakalaNumber: "وكالة-123/2026", notaryPublicName: "كاتب عدل عمان", type: "عامة", issueDate: "2026-01-15", status: "Active" },
        { id: "w-2", clientId: 2, wakalaNumber: "وكالة-456/2025", notaryPublicName: "كاتب عدل غرب عمان", type: "خاصة", issueDate: "2025-06-20", status: "Active" }
      ]);
    }

    // Load Cases
    if (savedCases) {
      setCases(JSON.parse(savedCases));
    } else {
      setCases([
        { id: "c-1", clientId: 1, caseNumber: "543/2026", year: 2026, courtName: "محكمة البداية", caseType: "حقوقي", status: "مفتوحة", claimAmount: 12000 },
        { id: "c-2", clientId: 1, caseNumber: "89/2025", year: 2025, courtName: "محكمة الصلح", caseType: "جزائي", status: "مغلقة", claimAmount: 1500 }
      ]);
    }

    // Load Hearings
    if (savedHearings) {
      setHearings(JSON.parse(savedHearings));
    } else {
      setHearings([
        { id: "h-1", caseId: "c-1", sessionDate: "2026-09-15T09:00:00.000Z", judicialPanel: "القاضي أحمد الفايز", notes: "تم تقديم البينات الشخصية والمستندات الخطية من قبل وكيل الجهة المدعية.", nextSessionDate: "2026-10-20T09:00:00.000Z", requiredActions: "تبليغ الجهة المدعى عليها لحضور الجلسة القادمة لتقديم دفاعها." },
        { id: "h-2", caseId: "c-2", sessionDate: "2025-11-20T10:00:00.000Z", judicialPanel: "القاضي محمود الطراونة", notes: "صدر قرار الحكم الفاصل في الدعوى وإلزام المدعى عليه بالتعويض بالكامل وغرامات التأخير." }
      ]);
    }

    // Load LegalFinancials
    if (savedFinancials) {
      setLegalFinancials(JSON.parse(savedFinancials));
    } else {
      setLegalFinancials([
        { id: "f-1", caseId: "c-1", type: "رسوم محاكم", amount: 360, date: "2026-08-01" },
        { id: "f-2", caseId: "c-1", type: "طوابع", amount: 20, date: "2026-08-01" },
        { id: "f-3", caseId: "c-1", type: "أتعاب خبرة", amount: 500, date: "2026-08-15" }
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
      localStorage.setItem("legalprop_wakalas", JSON.stringify(wakalas));
      localStorage.setItem("legalprop_cases", JSON.stringify(cases));
      localStorage.setItem("legalprop_hearings", JSON.stringify(hearings));
      localStorage.setItem("legalprop_legalFinancials", JSON.stringify(legalFinancials));
    }
  }, [clients, properties, tasks, wakalas, cases, hearings, legalFinancials, isLoaded]);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <GlobalContext.Provider value={{ 
      clients, setClients, 
      properties, setProperties, 
      tasks, setTasks,
      wakalas, setWakalas,
      cases, setCases,
      hearings, setHearings,
      legalFinancials, setLegalFinancials
    }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error("useGlobal must be used within GlobalProvider");
  return context;
}
