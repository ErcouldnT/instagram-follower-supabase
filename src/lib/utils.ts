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
