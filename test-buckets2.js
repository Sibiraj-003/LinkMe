import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.VITE_SUPABASE_URL}/storage/v1/bucket`;
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log(data);
}
run();
