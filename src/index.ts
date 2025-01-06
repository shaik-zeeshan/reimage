import { zValidator } from "@hono/zod-validator";
import got from "got";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import sharp from "sharp";
import { getFile, saveFile } from "./bucket";
import { generateUUID, uniqueQueryID } from "./helpers";
import { stream } from "hono/streaming";
import { PassThrough } from "node:stream";
import { createSharpTransformer, sharpQueryOptions } from "./sharp";
import { getImageMimeType } from "./format";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/image", zValidator("query", sharpQueryOptions), async (c) => {
	try {
		const queries = c.req.valid("query");
		const uniqueQueryId = uniqueQueryID(c.req.url);
		const fileId = `${generateUUID(queries.url)}-${uniqueQueryId}.${queries.format || "jpeg"}`;

		const image = await getFile(fileId);

		if (image !== undefined) {
			return c.redirect(image);
		}

		const pipeline = createSharpTransformer(sharp(), queries);
		const mimetype = getImageMimeType(queries.format || "jpeg");

		const saveFileStream = saveFile(fileId, mimetype);

		pipeline.pipe(saveFileStream);

		const processedStream = pipeline.pipe(new PassThrough());

		got.stream(queries.url).pipe(pipeline);

		c.header("Content-Type", mimetype);
		return stream(c, async (stream) => {
			// Write a process to be executed when aborted.
			stream.onAbort(() => {
				console.log("Aborted!");
			});

			for await (const chunk of processedStream) {
				await stream.write(chunk);
			}
		});
	} catch (e) {
		if (e instanceof Error) {
			return c.json({
				error: e.message,
			});
		}
		return c.json({
			error: "Internal Server Error",
		});
	}
});

export const handler = handle(app);
