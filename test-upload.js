import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aywxvjrbfiqqzsrzrnhb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T0tm58HqovW-CC59j_m1yw_G7xwISJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const dummyString = "hello world";
  const blob = new Blob([dummyString], { type: 'text/plain' });
  
  const res1 = await supabase.storage.from('resume').upload('test.txt', blob, { upsert: true });
  console.log('resume upload:', res1.error ? res1.error.message : 'success');
  
  const res2 = await supabase.storage.from('resumes').upload('test.txt', blob, { upsert: true });
  console.log('resumes upload:', res2.error ? res2.error.message : 'success');
}
test();
