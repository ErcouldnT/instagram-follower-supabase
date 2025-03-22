import axios from "axios";
import { json } from "@sveltejs/kit";
import { cookieString } from "$lib/utils";

export const GET = async ({ params }) => {
	const { username } = params;
	const SEARCH_USERNAME_URL = `https://www.instagram.com/web/search/topsearch/?query=${username}`;

	try {
		const response = await axios.get(SEARCH_USERNAME_URL, {
			headers: {
				Cookie: cookieString
			},
			withCredentials: true
		});

		return json(response.data);
	} catch (error) {
		return json({ error: "Veri alınamadı" }, { status: 500 });
	}
};
