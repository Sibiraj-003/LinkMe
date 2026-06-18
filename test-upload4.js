import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aywxvjrbfiqqzsrzrnhb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T0tm58HqovW-CC59j_m1yw_G7xwISJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const dummyString = "hello world";
  const blob = new Blob([dummyString], { type: 'text/plain' });
  const res = await supabase.storage.from('Resume').upload('test.txt', blob, { upsert: true });
  console.log('Resume upload:', res.error ? res.error.message : 'success');
}
test();
