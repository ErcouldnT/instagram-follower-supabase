import axios from "axios";
import { json } from "@sveltejs/kit";
import { cookieString, sleep } from "$lib/utils";
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

const urlGenerator = (nextCode?: string) => {
	if (nextCode === undefined) {
		// First url
		return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`;
	}
	return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${ds_user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${nextCode}"}`;
};

let ds_user_id = "";
const results: UserNode[] = [];
let scrollCycle = 0;
let hasNext = true;
let currentFollowedUsersCount = 0;
let totalFollowedUsersCount = -1;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let percentage = 0;

export const GET = async ({ params }) => {
	ds_user_id = params.id;
	let url = urlGenerator();
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			try {
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
						totalFollowedUsersCount = receivedData.count;
					}

					hasNext = receivedData.page_info.has_next_page;
					url = urlGenerator(receivedData.page_info.end_cursor);
					currentFollowedUsersCount += receivedData.edges.length;
					receivedData.edges.forEach((x) => results.push(x.node));
					percentage = Math.round((currentFollowedUsersCount / totalFollowedUsersCount) * 100);

					for (const user of receivedData.edges) {
						const chunk = JSON.stringify(user.node);
						controller.enqueue(encoder.encode(chunk + "\n"));
					}

					// Pause scanning if user requested so.
					// while (scanningPaused) {
					// 	await sleep(1000);
					// 	console.info("Scan paused");
					// }

					await sleep(
						Math.floor(
							Math.random() *
								(timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7)
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
				controller.close();
			} catch (error) {
				controller.error("Veri alınamadı");
			}
		}
	});

	return new Response(stream, {
		headers: { "Content-Type": "application/json; charset=utf-8" }
	});

	// return json({
	// 	ds_user_id,
	// 	// currentFollowedUsersCount,
	// 	totalFollowedUsersCount,
	// 	// scrollCycle,
	// 	percentage,
	// 	// scanningPaused,
	// 	results
	// });

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
