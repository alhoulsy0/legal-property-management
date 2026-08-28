import { supabase } from "./supabase";

export type DocumentCategory = "wakala" | "pleadings" | "evidence" | "minutes" | "judgments";

export interface VaultFile {
  name: string;
  path: string;
  category: DocumentCategory;
  size?: number;
  created_at?: string;
  url?: string;
}

const BUCKET_NAME = "legal-documents";

// Checks if Supabase client is properly configured with real variables
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder_key"
  );
};

/**
 * Get Mock files from LocalStorage for demo fallback
 */
const getMockFiles = (): VaultFile[] => {
  if (typeof window === "undefined") return [];
  const files = localStorage.getItem("legalprop_vault_files");
  return files ? JSON.parse(files) : [
    { name: "وكالة_عدلية_موقعة.pdf", path: "1/c-1/wakala/وكالة_عدلية_موقعة.pdf", category: "wakala", size: 1024000, created_at: new Date().toISOString() },
    { name: "لائحة_الدعوى_النهائية.pdf", path: "1/c-1/pleadings/لائحة_الدعوى_النهائية.pdf", category: "pleadings", size: 2048000, created_at: new Date().toISOString() },
    { name: "تقرير_الخبرة_الفني.pdf", path: "1/c-1/evidence/تقرير_الخبرة_الفني.pdf", category: "evidence", size: 4500000, created_at: new Date().toISOString() }
  ];
};

/**
 * Save Mock files to LocalStorage
 */
const saveMockFiles = (files: VaultFile[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("legalprop_vault_files", JSON.stringify(files));
  }
};

/**
 * Uploads a document to the Supabase Storage Bucket, maintaining directory structure:
 * /[client_id]/[case_id]/[document_category]/[filename]
 */
export async function uploadCaseDocument(
  clientId: string | number,
  caseId: string,
  category: DocumentCategory,
  file: File
): Promise<{ success: boolean; path?: string; error?: string }> {
  const filePath = `${clientId}/${caseId}/${category}/${file.name}`;

  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured. Using localStorage mock upload.");
    const mockFiles = getMockFiles();
    
    // Check duplicate
    if (mockFiles.some(f => f.path === filePath)) {
      return { success: false, error: "المستند مسجل بالفعل بنفس الاسم والتصنيف." };
    }

    const newFile: VaultFile = {
      name: file.name,
      path: filePath,
      category,
      size: file.size,
      created_at: new Date().toISOString()
    };

    saveMockFiles([...mockFiles, newFile]);
    return { success: true, path: filePath };
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return { success: false, error: "فشل تحميل الملف إلى الخادم." };
    }

    return { success: true, path: data.path };
  } catch (err) {
    console.error("Unexpected storage error:", err);
    return { success: false, error: "حدث خطأ غير متوقع أثناء تحميل الملف." };
  }
}

/**
 * Lists all documents in a specific case folder for a given category
 */
export async function listCaseDocuments(
  clientId: string | number,
  caseId: string,
  category: DocumentCategory
): Promise<VaultFile[]> {
  const folderPath = `${clientId}/${caseId}/${category}`;

  if (!isSupabaseConfigured()) {
    const mockFiles = getMockFiles();
    return mockFiles.filter(f => f.path.startsWith(folderPath) && f.category === category);
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderPath);

    if (error) {
      console.error("Supabase storage list error:", error);
      return [];
    }

    return data.map(item => ({
      name: item.name,
      path: `${folderPath}/${item.name}`,
      category,
      size: item.metadata?.size,
      created_at: item.created_at || undefined
    }));
  } catch (err) {
    console.error("Unexpected storage list error:", err);
    return [];
  }
}

/**
 * Generates a temporary signed download URL for viewing or downloading a file
 */
export async function getDocumentUrl(filePath: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Return a dummy PDF/object url for mockup
    return "#";
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 60); // 60 seconds link lifetime

    if (error) {
      console.error("Supabase signed url error:", error);
      return "#";
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Unexpected signed url generation error:", err);
    return "#";
  }
}

/**
 * Deletes a document from the vault
 */
export async function deleteCaseDocument(filePath: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    const mockFiles = getMockFiles();
    saveMockFiles(mockFiles.filter(f => f.path !== filePath));
    return true;
  }

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Supabase delete storage file error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected delete storage error:", err);
    return false;
  }
}
