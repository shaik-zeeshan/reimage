import { drizzle } from "drizzle-orm/libsql";
import { Resource } from "sst";

export const db = drizzle({
	connection: {
		url: Resource.TURSO_CONNECTION_URL.value,
		authToken: Resource.TURSO_AUTH_TOKEN.value,
	},
});
