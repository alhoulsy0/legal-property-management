"use server";

import { supabase } from "@/lib/supabase";

export interface CreateCaseInput {
  clientId: string;
  caseNumber: string;
  year: number;
  courtName: "محكمة الصلح" | "محكمة البداية" | "محكمة الاستئناف" | "محكمة التمييز" | "محكمة شرعية" | "أخرى";
  caseType: "حقوقي" | "جزائي" | "شرعي";
  claimAmount: number;
  status?: string;
}

export interface AddHearingInput {
  caseId: string;
  sessionDate: string; // ISO string or timestamp
  judicialPanel?: string;
  notes?: string;
  nextSessionDate?: string; // ISO string or timestamp
  requiredActions?: string;
}

/**
 * 1. Client Intake & Wakala Check
 * Registers a new case for a client, ensuring they have an 'Active' Wakala on file.
 */
export async function createCase(data: CreateCaseInput) {
  try {
    // Check if client has an 'Active' Wakala
    const { data: activeWakala, error: wakalaError } = await supabase
      .from("wakalas")
      .select("id")
      .eq("client_id", data.clientId)
      .eq("status", "Active")
      .limit(1)
      .maybeSingle();

    if (wakalaError) {
      console.error("Wakala query error:", wakalaError);
      return { success: false, error: "حدث خطأ أثناء التحقق من الوكالة العدلية للموكل." };
    }

    if (!activeWakala) {
      return { success: false, error: "لا توجد وكالة صالحة لهذا الموكل" };
    }

    // Insert new case record
    const { data: newCase, error: insertError } = await supabase
      .from("cases")
      .insert({
        client_id: data.clientId,
        case_number: data.caseNumber,
        year: data.year,
        court_name: data.courtName,
        case_type: data.caseType,
        claim_amount: data.claimAmount,
        status: data.status || "مفتوحة"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert case error:", insertError);
      if (insertError.code === "23505") {
        return { success: false, error: "رقم الدعوى هذا مسجل بالفعل لنفس السنة والمحكمة." };
      }
      return { success: false, error: "فشل تسجيل القضية الجديدة في النظام." };
    }

    return { success: true, data: newCase };
  } catch (err) {
    console.error("Unexpected error in createCase:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء المعالجة." };
  }
}

/**
 * 2. Hearing Management
 * Inserts a new hearing session and schedules a reminder 48 hours before the next session date if provided.
 */
export async function addHearing(data: AddHearingInput) {
  try {
    // 1. Insert the hearing session
    const { data: newHearing, error: hearingError } = await supabase
      .from("hearings")
      .insert({
        case_id: data.caseId,
        session_date: data.sessionDate,
        judicial_panel: data.judicialPanel,
        notes: data.notes,
        next_session_date: data.nextSessionDate || null,
        required_actions: data.requiredActions
      })
      .select()
      .single();

    if (hearingError) {
      console.log("Insert hearing error:", hearingError);
      return { success: false, error: "حدث خطأ أثناء تسجيل الجلسة الجديدة." };
    }

    // 2. If a next session date is scheduled, set a reminder 48 hours before it
    if (data.nextSessionDate) {
      const nextSessionTime = new Date(data.nextSessionDate).getTime();
      const reminderTime = nextSessionTime - 48 * 60 * 60 * 1000; // 48 Hours earlier

      // Get Case Number to build a descriptive reminder message
      const { data: caseInfo } = await supabase
        .from("cases")
        .select("case_number, year")
        .eq("id", data.caseId)
        .single();

      const caseLabel = caseInfo ? `${caseInfo.case_number}/${caseInfo.year}` : "";
      const reminderMsg = `تذكير: اقتراب موعد الجلسة القادمة للدعوى رقم (${caseLabel}) خلال 48 ساعة.`;

      const { error: reminderError } = await supabase
        .from("reminders")
        .insert({
          case_id: data.caseId,
          reminder_date: new Date(reminderTime).toISOString(),
          message: reminderMsg,
          is_sent: false
        });

      if (reminderError) {
        console.error("Error setting hearing reminder:", reminderError);
        // We log the error but don't fail the whole action because the hearing was registered successfully
      }
    }

    return { success: true, data: newHearing };
  } catch (err) {
    console.error("Unexpected error in addHearing:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء حفظ الجلسة." };
  }
}

/**
 * 3. Judgment & Appeal Timer
 * Sets a judgment date and computes the legal deadline for filing an appeal based on the court type.
 */
export async function recordJudgment(caseId: string, judgmentDate: string, courtType: string) {
  try {
    // magistrate (محكمة الصلح) -> 10 days
    // first instance (محكمة البداية) -> 30 days
    // appeals (محكمة الاستئناف) -> 30 days
    const daysToAdd = (courtType === "محكمة الصلح") ? 10 : 30;

    const deadline = new Date(judgmentDate);
    deadline.setDate(deadline.getDate() + daysToAdd);

    // Format the date back to YYYY-MM-DD
    const appealDeadlineStr = deadline.toISOString().split("T")[0];

    // Update case record with judgment and appeal deadline
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update({
        status: "حكم فاصِل",
        judgment_date: judgmentDate,
        appeal_deadline: appealDeadlineStr
      })
      .eq("id", caseId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating judgment status:", updateError);
      return { success: false, error: "فشل تحديث حالة الحكم والمهلة القانونية للاستئناف." };
    }

    return { 
      success: true, 
      data: updatedCase,
      message: `تم تسجيل الحكم بنجاح. مهلة الاستئناف تنتهي بتاريخ ${appealDeadlineStr} (بعد ${daysToAdd} يوماً).`
    };
  } catch (err) {
    console.error("Unexpected error in recordJudgment:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء معالجة الحكم قضائياً." };
  }
}
