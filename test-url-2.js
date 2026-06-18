import fetch from 'node-fetch';

async function run() {
  const url = 'https://aywxvjrbfiqqzsrzrnhb.supabase.co/storage/v1/object/public/resumes/c526a2b9-25f5-47f6-b6a9-013ca486b2f2/1781679480631_SibiRajSResume.pdf';
  const res = await fetch(url);
  const text = await res.text();
  console.log(res.status, text);
}
run();
