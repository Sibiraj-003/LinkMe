import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aywxvjrbfiqqzsrzrnhb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_T0tm58HqovW-CC59j_m1yw_G7xwISJ8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = `sibirajaaaa+test@gmail.com`; // using user's email
  const { data: auth, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authError) {
    console.log('Signup failed:', authError.message);
    return;
  }
  
  const jwt = auth.session.access_token;
  
  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${jwt}`
      }
  });
  const data = await res.json();
  console.log('Buckets:', data);
}
test();
