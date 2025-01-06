import { v5 as uuidv5 } from "uuid";

export function generateUUID(url: string) {
	return uuidv5(url, uuidv5.URL);
}

export function uniqueQueryID(url: string) {
	const queryURL = new URL(url);

	queryURL.searchParams.delete("url");

	return queryURL.search;
}
