import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aywxvjrbfiqqzsrzrnhb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T0tm58HqovW-CC59j_m1yw_G7xwISJ8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const blob = new Blob(["hello world"], { type: 'text/plain' });
  const buckets = ['resumeUrl', 'resumes_public', 'public_resumes', 'public', 'resume_pdfs', 'pdf_resumes', 'Supabase'];
  for (const b of buckets) {
      const res = await supabase.storage.from(b).upload('test.txt', blob, { upsert: true });
      console.log(b, 'upload:', res.error ? res.error.message : 'success');
  }
}
test();
