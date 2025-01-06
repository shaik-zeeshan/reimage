import { Resource } from "sst";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dialect: "turso",
	dbCredentials: {
		url: Resource.TURSO_CONNECTION_URL.value,
		authToken: Resource.TURSO_AUTH_TOKEN.value,
	},
});
