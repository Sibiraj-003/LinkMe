import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aywxvjrbfiqqzsrzrnhb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T0tm58HqovW-CC59j_m1yw_G7xwISJ8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log('Buckets:', data);
  console.log('Error:', error);
}

main();
