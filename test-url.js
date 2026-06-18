import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://aywxvjrbfiqqzsrzrnhb.supabase.co', 'dummy_key');
const { data } = supabase.storage.from('resumes').getPublicUrl('somepath.pdf');
console.log(data);
