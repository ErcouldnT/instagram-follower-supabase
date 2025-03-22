import {
	CSRFTOKEN,
	DATR,
	DS_USER_ID,
	IG_DID,
	IG_DIRECT_REGION_HINT,
	MID,
	PS_L,
	PS_N,
	RUR,
	SESSIONID,
	WD
} from "$env/static/private";

const cookies = {
	csrftoken: CSRFTOKEN,
	datr: DATR,
	ds_user_id: DS_USER_ID,
	ig_did: IG_DID,
	ig_direct_region_hint: IG_DIRECT_REGION_HINT,
	mid: MID,
	ps_l: PS_L,
	ps_n: PS_N,
	rur: RUR,
	sessionid: SESSIONID,
	wd: WD
};

export const cookieString = Object.entries(cookies)
	.map(([key, value]) => `${key}=${value}`)
	.join("; ");

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const urlGenerator = (user_id: string, nextCode?: string) => {
	if (nextCode === undefined) {
		// First url
		return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${user_id}","include_reel":"true","fetch_mutual":"false","first":"24"}`;
	}
	return `https://www.instagram.com/graphql/query/?query_hash=3dec7e2c57367ef3da3d987d89f9dbc8&variables={"id":"${user_id}","include_reel":"true","fetch_mutual":"false","first":"24","after":"${nextCode}"}`;
};
