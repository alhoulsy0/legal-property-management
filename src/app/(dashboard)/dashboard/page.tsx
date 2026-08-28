"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, DollarSign, TrendingUp, Users, Activity, Calendar, CheckSquare, Clock, Plus, Scale, Building, ArrowRight, ChevronLeft, ChevronRight, Trash2, CalendarDays, PlusCircle, HelpCircle } from "lucide-react";
import { useGlobal } from "../GlobalProvider";

export default function DashboardPage() {
  const { 
    properties, 
    tasks, setTasks, 
    clients, 
    cases, 
    hearings, 
    legalFinancials 
  } = useGlobal();

  // 1. PROPERTY MANAGEMENT METRICS
  let expectedRevenue = properties.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
  let totalExpenses = properties.reduce((acc, curr) => {
    return acc + (curr.expenses?.reduce((eAcc, eCurr) => eAcc + (Number(eCurr.amount) || 0), 0) || 0);
  }, 0);
  let netCashFlow = expectedRevenue - totalExpenses;

  // 2. LEGAL SYSTEM METRICS
  const activeCasesCount = cases.filter(c => c.status === "مفتوحة" || c.status === "نشطة").length;
  const totalClaimsSum = cases.reduce((sum, c) => sum + (c.claimAmount || 0), 0);
  
  // 3. DUAL ALERTS & NOTIFICATIONS
  let alerts: any[] = [];
  const today = new Date();

  properties.forEach(p => {
    if (p.status === "Delayed") {
      alerts.push({ id: `d-${p.id}`, type: "إيجار متأخر", message: `الإيجار متأخر لعقار: ${p.name}.`, priority: "medium" });
    } else if (p.status === "Litigation") {
      alerts.push({ id: `l-${p.id}`, type: "نزاع قضائي جاري", message: `نزاع قانوني معلق لعقار: ${p.name}.`, priority: "high" });
    }
  });

  cases.forEach(c => {
    if (c.appeal_deadline) {
      const deadline = new Date(c.appeal_deadline);
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 15) {
        alerts.push({
          id: `case-appeal-${c.id}`,
          type: "اقتراب انتهاء مهلة الاستئناف",
          message: `تنبيه: اقتراب انتهاء مهلة الاستئناف للدعوى رقم (${c.caseNumber}) المتبقي ${diffDays} أيام.`,
          priority: "high"
        });
      }
    }
  });

  // 4. INTERACTIVE CALENDAR STATE & DATA
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(new Date().toISOString().split("T")[0]);
  const [customEvents, setCustomEvents] = useState<any[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Form states for new calendar event
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventClient, setNewEventClient] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventType, setNewEventType] = useState<"legal" | "property" | "custom">("legal");
  const [newEventNotes, setNewEventNotes] = useState("");

  // Load customEvents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("legalprop_custom_calendar_events");
    if (saved) {
      setCustomEvents(JSON.parse(saved));
    } else {
      // Seed some initial custom appointments
      const initial = [
        {
          id: "seed-1",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split("T")[0],
          title: "استشارة قانونية: توقيع ملحق العقد المشترك",
          clientName: "شركة الأفق للاستيراد والتصدير",
          time: "11:30 صباحاً",
          type: "legal",
          isAuto: false,
          notes: "في مكتب عمان الرئيسي"
        },
        {
          id: "seed-2",
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split("T")[0],
          title: "معاينة شقة ضاحية الرشيد مع المستأجر الجديد",
          clientName: "أحمد علي",
          time: "04:00 مساءً",
          type: "property",
          isAuto: false,
          notes: "التنسيق مع الحارس"
        }
      ];
      setCustomEvents(initial);
      localStorage.setItem("legalprop_custom_calendar_events", JSON.stringify(initial));
    }
  }, []);

  // Save customEvents when updated
  const saveCustomEvents = (events: any[]) => {
    setCustomEvents(events);
    localStorage.setItem("legalprop_custom_calendar_events", JSON.stringify(events));
  };

  // Compile all system activities for the calendar
  const getCombinedEvents = () => {
    const events: any[] = [];

    // 1. Automatic Hearings events
    hearings.forEach(h => {
      if (h.nextSessionDate) {
        const dateStr = h.nextSessionDate.split("T")[0];
        const c = cases.find(cs => cs.id === h.caseId);
        const client = c ? clients.find(cl => cl.id === c.clientId) : null;
        events.push({
          id: `auto-hearing-${h.id}`,
          date: dateStr,
          title: `جلسة محكمة: دعوى رقم ${c ? c.caseNumber : ""}`,
          clientName: client ? client.name : "غير معروف",
          time: "10:30 صباحاً",
          type: "legal",
          isAuto: true,
          notes: h.requiredActions ? `الإجراء المطلوب: ${h.requiredActions}` : ""
        });
      }
    });

    // 2. Automatic rent collections / expiries events
    properties.forEach(p => {
      if (p.nextRentDate) {
        const client = clients.find(cl => cl.id === p.clientId);
        events.push({
          id: `auto-rent-${p.id}`,
          date: p.nextRentDate,
          title: `تحصيل إيجار: ${p.name}`,
          clientName: client ? client.name : "غير معروف",
          time: "09:00 صباحاً",
          type: "property",
          isAuto: true,
          notes: `المستأجر: ${p.tenant || "N/A"}`
        });
      }

      if (p.endDate) {
        const client = clients.find(cl => cl.id === p.clientId);
        events.push({
          id: `auto-expiry-${p.id}`,
          date: p.endDate,
          title: `تاريخ انتهاء عقد: ${p.name}`,
          clientName: client ? client.name : "غير معروف",
          time: "10:00 صباحاً",
          type: "property",
          isAuto: true,
          notes: "مراجعة شروط التجديد التلقائي"
        });
      }
    });

    // 3. User custom events
    customEvents.forEach(e => {
      events.push({
        ...e,
        isAuto: false
      });
    });

    return events;
  };

  const allEvents = getCombinedEvents();

  // Tasks toggling & addition
  const [newTaskText, setNewTaskText] = useState("");
  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: true } : t));
    setTimeout(() => {
      setTasks(current => current.filter(t => t.id !== id));
    }, 400);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      setTasks([{ id: Date.now(), text: newTaskText, done: false }, ...tasks]);
      setNewTaskText("");
    }
  };

  // Calendar helpers
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    const formattedTime = newEventTime ? (
      Number(newEventTime.split(":")[0]) >= 12 ? 
      `${(Number(newEventTime.split(":")[0]) - 12) || 12}:${newEventTime.split(":")[1]} مساءً` : 
      `${newEventTime} صباحاً`
    ) : "10:00 صباحاً";

    const newEv = {
      id: `custom-${Date.now()}`,
      date: newEventDate,
      title: newEventTitle,
      clientName: newEventClient || "بدون تحديد موكل",
      time: formattedTime,
      type: newEventType,
      notes: newEventNotes,
      isAuto: false
    };

    saveCustomEvents([...customEvents, newEv]);
    
    // Reset Form
    setNewEventTitle("");
    setNewEventClient("");
    setNewEventNotes("");
    setShowAddEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (id.startsWith("auto-")) {
      alert("هذا نشاط مبرمج تلقائياً من النظام ولا يمكن حذفه إلا بتعديل تاريخ القضية أو العقار المعني.");
      return;
    }
    const confirmed = window.confirm("هل أنت متأكد من إلغاء هذا الموعد المخصص؟");
    if (confirmed) {
      saveCustomEvents(customEvents.filter(e => e.id !== id));
    }
  };

  // Generate calendar grid array
  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday is 0, Saturday is 6
    // Shift index so Saturday is 0 (RTL representation)
    const startOffset = (firstDayIndex + 1) % 7; 
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];

    // Prefix days (from previous month)
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, prevDay);
      const dateStr = prevDate.toISOString().split("T")[0];
      grid.push({ day: prevDay, dateStr, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      // Ensure local time is used to avoid timezone drift
      const localYear = currentDate.getFullYear();
      const localMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
      const localDay = String(currentDate.getDate()).padStart(2, "0");
      const dateStr = `${localYear}-${localMonth}-${localDay}`;
      grid.push({ day: i, dateStr, isCurrentMonth: true });
    }

    // Suffix days (from next month)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split("T")[0];
      grid.push({ day: i, dateStr, isCurrentMonth: false });
    }

    return grid;
  };

  const calendarGrid = renderCalendarDays();
  const selectedDayEvents = allEvents.filter(e => e.date === selectedDayStr);

  const monthNamesArabic = [
    "كانون الثاني (1)", "شباط (2)", "آذار (3)", "نيسان (4)", "أيار (5)", "حزيران (6)",
    "تموز (7)", "آب (8)", "أيلول (9)", "تشرين الأول (10)", "تشرين الثاني (11)", "كانون الأول (12)"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right">
      
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-700 hover:text-slate-900 border border-slate-200">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">لوحة القيادة الموحدة</h1>
            <p className="text-slate-500 mt-1 text-sm font-semibold">متابعة فورية للمؤشرات المالية للأملاك والعقارات بالإضافة للملفات القانونية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/clients"
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl transition-colors font-bold flex items-center gap-2 text-sm shadow-sm"
          >
            <Building className="w-4 h-4 text-slate-600" />
            <span>إدارة العقارات</span>
          </Link>
          <Link
            href="/cases"
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold flex items-center gap-2 text-sm shadow-md"
          >
            <Scale className="w-5 h-5 text-blue-400" />
            <span>سجل القضايا</span>
          </Link>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Expected Rent */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
            <div className="p-2 bg-slate-100 rounded-xl">
              <DollarSign className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">إجمالي الإيجارات (المتوقعة)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">د.أ {expectedRevenue.toLocaleString()}</p>
        </div>
        
        {/* Metric 2: Active Cases */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-emerald-600 mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">ملفات القضايا النشطة</h3>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{activeCasesCount} قضايا</p>
        </div>

        {/* Metric 3: Total Claims */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 text-indigo-600 mb-3">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold">إجمالي المطالبات القضائية</h3>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600">د.أ {totalClaimsSum.toLocaleString()}</p>
        </div>

        {/* Metric 4: Net Property Cash Flow */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-md border border-slate-800">
          <div className="flex items-center gap-3 text-slate-350 mb-3">
            <div className="p-2 bg-slate-800 rounded-xl text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">صافي التدفقات للملاك</h3>
          </div>
          <p className="text-3xl font-extrabold text-white">د.أ {netCashFlow.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column (2 widths): Unified Alerts + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unified Alerts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                الإنذارات والمخالفات النشطة
              </h2>
              <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">{alerts.length} حالة</span>
            </div>
            <div className="grid gap-3">
              {alerts.length === 0 && <p className="text-sm font-bold text-slate-500 italic p-2">لا يوجد أي مخالفات حالياً.</p>}
              {alerts.map((alert: any) => (
                <div key={alert.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${alert.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-extrabold ${alert.priority === "high" ? "text-rose-800" : "text-amber-800"}`}>
                      حالة: {alert.type}
                    </p>
                    <p className="text-sm mt-1 text-slate-700 font-semibold leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Admin Tasks */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col max-h-[450px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-blue-600" />
                المهام القانونية والإدارية
              </h2>
            </div>
            
            <form onSubmit={addTask} className="mb-5 flex gap-3">
              <input
                type="text"
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                placeholder="أضف مهمة جديدة..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder-slate-600 text-slate-900"
              />
              <button type="submit" className="px-5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto pl-2 custom-scrollbar">
              {tasks.length === 0 && <p className="text-sm font-bold text-slate-500 italic p-2 text-center">لا توجد مهام معلقة!</p>}
              {tasks.map(task => (
                <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 cursor-pointer ${task.done ? 'bg-slate-100 opacity-50 scale-95' : 'bg-slate-50 hover:bg-slate-100'}`} onClick={() => toggleTask(task.id)}>
                  <input type="checkbox" checked={task.done} readOnly className="w-5 h-5 rounded border-slate-300 text-blue-600 pointer-events-none" />
                  <span className={`text-sm font-bold ${task.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: INTERACTIVE SYSTEM CALENDAR */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span>أجندة المواعيد والأنشطة</span>
            </h2>
            
            {/* Month switch navigation */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-lg transition-colors text-slate-700"><ChevronRight className="w-4 h-4" /></button>
              <span className="text-[10px] font-black text-slate-800 px-1 shrink-0">{monthNamesArabic[calendarDate.getMonth()]} {calendarDate.getFullYear()}</span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-lg transition-colors text-slate-700"><ChevronLeft className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Calendar Grid Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 mb-2">
            <div>سبت</div>
            <div>أحد</div>
            <div>اثنين</div>
            <div>ثلاثاء</div>
            <div>أربعاء</div>
            <div>خميس</div>
            <div>جمعة</div>
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {calendarGrid.map((cell, idx) => {
              const dayEvents = allEvents.filter(e => e.date === cell.dateStr);
              const isSelected = selectedDayStr === cell.dateStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayStr(cell.dateStr)}
                  type="button"
                  className={`aspect-square p-1.5 rounded-xl text-[11px] font-extrabold flex flex-col justify-between items-center transition-all border relative ${
                    cell.isCurrentMonth ? "text-slate-900" : "text-slate-400 opacity-40 bg-slate-50/50"
                  } ${
                    isSelected ? "bg-slate-900 text-white border-slate-900 scale-105 shadow-md shadow-slate-900/10 z-10" : "bg-white hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span>{cell.day}</span>
                  
                  {/* Indicator Dots */}
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5 justify-center">
                      {dayEvents.slice(0, 3).map((e, index) => (
                        <span 
                          key={index} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.type === 'legal' ? 'bg-blue-500' : e.type === 'property' ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Events Detail List for Selected Day */}
          <div className="border-t border-slate-100 pt-4 space-y-3 flex-1 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-500">مواعيد يوم: {new Date(selectedDayStr).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</span>
                <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">{selectedDayEvents.length} نشاط</span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[250px] custom-scrollbar pl-1">
                {selectedDayEvents.length === 0 && (
                  <p className="text-[11px] font-bold text-slate-400 italic py-6 text-center">لا توجد مواعيد أو نشاطات مجدولة لهذا اليوم.</p>
                )}
                {selectedDayEvents.map(e => (
                  <div key={e.id} className={`p-3 rounded-xl border text-right relative flex flex-col justify-between group transition-all hover:bg-slate-50/50 ${
                    e.type === 'legal' ? 'border-blue-100 bg-blue-50/10' : e.type === 'property' ? 'border-amber-100 bg-amber-50/10' : 'border-indigo-100 bg-indigo-50/10'
                  }`}>
                    
                    {/* Header line */}
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        e.type === 'legal' ? 'bg-blue-100 text-blue-800' : e.type === 'property' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {e.type === 'legal' ? 'قضائي' : e.type === 'property' ? 'عقاري' : 'موعد مخصص'}
                      </span>
                      
                      {/* Delete icon (visible for custom events, or group-hovered) */}
                      {!e.isAuto && (
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition-colors"
                          title="إلغاء الموعد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {e.isAuto && (
                        <span className="text-[8px] bg-slate-100 border text-slate-500 px-1 rounded">تلقائي</span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-xs font-extrabold text-slate-900 mt-1.5 leading-relaxed">{e.title}</p>
                    
                    {/* Client & time details */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-2 pt-2 border-t border-dashed border-slate-100 text-[10px] text-slate-500">
                      <span className="font-bold">الموكل: {e.clientName || "N/A"}</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {e.time}
                      </span>
                    </div>

                    {e.notes && (
                      <p className="text-[9px] font-bold text-slate-400 mt-1.5 italic bg-slate-50 p-1.5 rounded">{e.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Button: Add event */}
            <button
              onClick={() => {
                setNewEventDate(selectedDayStr);
                setShowAddEventModal(true);
              }}
              type="button"
              className="mt-4 w-full bg-slate-100 border hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              <span>إضافة موعد / نشاط جديد</span>
            </button>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* ADD APPOINTMENT / EVENT MODAL             */}
      {/* ========================================== */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md flex flex-col p-6 text-right">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-slate-700" />
                <span>حجز موعد مخصص جديد للأجندة</span>
              </h3>
              <button 
                onClick={() => setShowAddEventModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <XClose />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddEventSubmit} className="space-y-4 text-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموعد / النشاط</label>
                <input
                  type="text"
                  placeholder="مثال: لقاء لمناقشة عقد الشقة"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموكل المعني (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: شركة الأفق"
                  value={newEventClient}
                  onChange={e => setNewEventClient(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الموعد (الوقت)</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع الموعد</label>
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="legal">قضائي ومحاكم (أزرق)</option>
                  <option value="property">تحصيل وعقود (أصفر)</option>
                  <option value="custom">موعد مخصص وعام (بنفسجي)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  placeholder="مكان اللقاء أو المستندات المطلوبة..."
                  value={newEventNotes}
                  onChange={e => setNewEventNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900 h-16 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-slate-50 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold"
                >
                  حفظ الموعد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Small SVG helper for closing button modal
function XClose() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
  );
}
