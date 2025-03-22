import { json } from "@sveltejs/kit";

export async function GET({ url }) {
	const imageUrl = url.searchParams.get("url");
	if (!imageUrl) {
		return json({ error: "URL parametresi eksik" }, { status: 400 });
	}

	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error("Resim alınamadı");
		}

		const contentType = response.headers.get("content-type");
		const imageBuffer = await response.arrayBuffer();

		return new Response(imageBuffer, {
			headers: {
				"Content-Type": contentType || "application/octet-stream",
				"Content-Length": imageBuffer.byteLength.toString(),
				"Cache-Control": "public, max-age=86400"
			}
		});
	} catch (error) {
		return json({ error: "Resim alınırken hata oluştu" }, { status: 500 });
	}
}
