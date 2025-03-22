import axios from "axios";
import { json } from "@sveltejs/kit";
import { supabase } from "$lib/supabase";
import { cookieString, sleep, urlGenerator } from "$lib/utils";
import type { Timings, User, UserNode } from "$lib/user.types.js";
import {
	DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
	DEFAULT_TIME_BETWEEN_UNFOLLOWS,
	DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
	DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS
} from "$lib/constants.js";

const timings: Timings = {
	timeBetweenSearchCycles: DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
	timeToWaitAfterFiveSearchCycles: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
	timeBetweenUnfollows: DEFAULT_TIME_BETWEEN_UNFOLLOWS,
	timeToWaitAfterFiveUnfollows: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS
};

// let scanningPaused = false;

// function pauseScan() {
// 	scanningPaused = !scanningPaused;
// }

export const GET = async ({ params }) => {
	const results: UserNode[] = [];
	let scrollCycle = 0;
	let hasNext = true;
	let currentFollowedUsersCount = 0;
	let totalFollowedUsersCount = -1;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let percentage = 0;

	const user_id = params.id;

	const { data: scanData, error: scanError } = await supabase
		.from("scans")
		.insert({ user_id })
		.select();

	const scan_id = scanData && scanData[0].id;

	if (scan_id === null) {
		return json({ error: "scan_id cannot be null" }, { status: 400 });
	}

	let url = urlGenerator(user_id);
	// const encoder = new TextEncoder();

	// const stream = new ReadableStream({
	// 	async start(controller) {
	// try {
	while (hasNext) {
		let receivedData: User;

		// try {
		// 	receivedData = (await fetch(url).then((res) => res.json())).data.user.edge_follow;
		// } catch (e) {
		// 	console.error(e);
		// 	continue;
		// }

		try {
			const response = await axios.get(url, {
				headers: {
					Cookie: cookieString
				},
				withCredentials: true,
				timeout: 10000 // ms cinsinden (örneğin burada 10 saniye)
			});
			receivedData = response.data.data.user.edge_follow;
			// return json(receivedData);
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				return json({ error: error.message, details: error.response?.data }, { status: 500 });
			} else {
				return json({ error: "An unknown error occurred" }, { status: 500 });
			}
		}

		if (totalFollowedUsersCount === -1) {
			totalFollowedUsersCount = receivedData.count - 1;
		}

		hasNext = receivedData.page_info.has_next_page;
		url = urlGenerator(user_id, receivedData.page_info.end_cursor);
		currentFollowedUsersCount += receivedData.edges.length;
		percentage = Math.floor((currentFollowedUsersCount / totalFollowedUsersCount) * 100);

		receivedData.edges.forEach((x) => results.push(x.node));

		// for (const user of receivedData.edges) {
		// 	const chunk = JSON.stringify(user.node);
		// 	controller.enqueue(encoder.encode(chunk + "\n"));
		// }

		// Pause scanning if user requested so.
		// while (scanningPaused) {
		// 	await sleep(1000);
		// 	console.info("Scan paused");
		// }

		await sleep(
			Math.floor(
				Math.random() * (timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7)
			) + timings.timeBetweenSearchCycles
		);

		scrollCycle++;

		if (scrollCycle > 6) {
			scrollCycle = 0;
			console.log({
				// show: true,
				text: `Sleeping ${timings.timeToWaitAfterFiveSearchCycles / 1000} seconds to prevent getting temp blocked`
			});
			await sleep(timings.timeToWaitAfterFiveSearchCycles);
		}
		// setToast({ show: false });
	}
	// 			controller.close();
	// 		} catch (error) {
	// 			controller.error("Veri alınamadı");
	// 		}
	// 	}
	// });

	// return new Response(stream, {
	// 	headers: { "Content-Type": "application/json; charset=utf-8" }
	// });

	const mappedResults = results.map((user) => ({
		scan_id,
		username: user.username,
		full_name: user.full_name,
		user_id: user.id,
		profile_pic_url: user.profile_pic_url,
		is_private: user.is_private,
		is_verified: user.is_verified,
		followed_by_viewer: user.followed_by_viewer,
		follows_viewer: user.follows_viewer,
		requested_by_viewer: user.requested_by_viewer
	}));

	const { data: userData, error: userError } = await supabase.from("users").insert(mappedResults);

	return json({
		user_id,
		// currentFollowedUsersCount,
		totalFollowedUsersCount,
		// scrollCycle,
		percentage,
		// scanningPaused,
		results
	});

	// try {
	// 	const response = await axios.get(url, {
	// 		headers: {
	// 			Cookie: cookieString
	// 		},
	// 		withCredentials: true,
	// 		timeout: 10000 // ms cinsinden (örneğin burada 10 saniye)
	// 	});

	// 	return json(response.data);
	// } catch (error) {
	// 	return json({ error: "Veri alınamadı" }, { status: 500 });
	// }
};
