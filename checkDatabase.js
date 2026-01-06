import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnthatrbvoumsjpkdbjm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGhhdHJidm91bXNqcGtkYmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODMxNTUsImV4cCI6MjA4MTM1OTE1NX0.AaB0pDje6cXuSQiCDxG1-BamF7yaDQtojw6kcgx6Dz4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  try {
    console.log('🔍 Kiểm tra kết nối Supabase...\n');
    
    const tableNames = ['classes', 'students', 'subjects', 'teachers', 'users', 'graduation_evaluations', 'promotion_results', 'teacher_evaluations'];
    
    for (const table of tableNames) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`⚠️  Table '${table}': Không tìm thấy hoặc lỗi`);
        } else {
          console.log(`📊 Table '${table}': ${count} records`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Lỗi kết nối`);
      }
    }
    
    console.log('\n✅ Kiểm tra xong!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

checkDatabase();
