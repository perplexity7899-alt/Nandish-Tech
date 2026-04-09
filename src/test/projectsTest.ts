// Test file to check if Supabase projects query works
import { supabase } from "@/integrations/supabase/client";

export async function testProjectsQuery() {
  console.log("🧪 Testing Supabase projects query...");
  
  try {
    const { data, error } = await (supabase as any)
      .from("projects")
      .select("*");
    
    if (error) {
      console.error("❌ Query error:", error);
      return { success: false, error };
    }
    
    console.log("✅ Query successful!");
    console.log("Data:", data);
    console.log("Count:", data?.length);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Exception:", err);
    return { success: false, error: err };
  }
}

// Run this in browser console: 
// import { testProjectsQuery } from '@/test/projectsTest'
// testProjectsQuery()
