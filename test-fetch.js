import fetch from 'node-fetch';

async function run() {
  const url = 'https://aywxvjrbfiqqzsrzrnhb.supabase.co/storage/v1/object/public/resumes/something.pdf';
  const res = await fetch(url);
  const text = await res.text();
  console.log(res.status, text);
}
run();
