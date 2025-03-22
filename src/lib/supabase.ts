import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";

// const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// console.log('Supabase URL:', supabaseUrl);
// console.log('Supabase Anon Key:', supabaseAnonKey);

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// export async function testSupabaseConnection() {
// 	const { data, error } = await supabase.from('tests').select('*').limit(1);

// 	if (error) {
// 		console.error('Supabase bağlantı hatası:', error.message);
// 		return false;
// 	} else {
// 		console.log('Supabase bağlantısı başarılı:', data);
// 		return true;
// 	}
// }

// testSupabaseConnection();
