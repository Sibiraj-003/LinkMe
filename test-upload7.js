import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const blob = new Blob(["test"], { type: 'application/pdf' });
  const buckets = ['card-resumes', 'app-resumes', 'cardify-resumes', 'pdf_uploads', 'resume-pdf', 'docs', 'files', 'storage'];
  for (const b of buckets) {
      const res = await supabase.storage.from(b).upload('test.pdf', blob, { upsert: true });
      console.log(b, 'upload:', res.error ? res.error.message : 'success');
  }
}
test();
