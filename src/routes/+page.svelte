<script lang="ts">
	import { supabase } from '$lib/supabase';

	async function testSupabaseConnection() {
		const { data, error } = await supabase.from('tests').select('*').limit(1);

		if (error) {
			console.error('Supabase bağlantı hatası:', error.message);
			return false;
		} else {
			console.log('Supabase bağlantısı başarılı:', data);
			return true;
		}
	}

	// testSupabaseConnection();
</script>

<div class="p-5 container h-full mx-auto flex justify-center items-center">
	<div class="space-y-5">
		<h1 class="h1">Let's get cracking bones!</h1>
		<p>Start by exploring:</p>
		<ul>
			<li><code class="code">/src/routes/+layout.svelte</code> - barebones layout</li>
			<li><code class="code">/src/app.postcss</code> - app wide css</li>
			<li>
				<code class="code">/src/routes/+page.svelte</code> - this page, you can replace the contents
			</li>
		</ul>
	</div>
</div>
