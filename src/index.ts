import { zValidator } from "@hono/zod-validator";
import got from "got";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import sharp from "sharp";
import { getFile, getFileSign, getPublicURL, saveFile } from "./bucket";
import { generateUUID, uniqueQueryID } from "./helpers";
import { createSharpTransformer, sharpQueryOptions } from "./sharp";
import { getImageMimeType } from "./format";
import { db } from "./db";
import { filesTable } from "./db/schema";

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
			return c.redirect(image, 301);
		}

		const pipeline = createSharpTransformer(sharp(), queries);
		const mimetype = getImageMimeType(queries.format || "jpeg");

		const { pass: saveFileStream, upload } = saveFile(fileId, mimetype);

		pipeline.pipe(saveFileStream);

		const status = await new Promise((resolve, reject) => {
			got.stream(queries.url).pipe(pipeline);

			upload
				.done()
				.then(async (data) => {
					await db.insert(filesTable).values({
						key: data.Key || fileId,
						publicURL: getPublicURL(data.Key || fileId),
					});
					resolve("done");
				})
				.catch(() => reject());
		});

		if (status !== "done") {
			throw new Error("Unable to process image");
		}

		const imagecheck = await getFileSign(fileId);

		if (imagecheck === undefined) {
			throw new Error("Image not Founded");
		}

		return c.redirect(imagecheck, 301);
	} catch (e) {
		if (e instanceof Error) {
			return c.json(
				{
					error: e.message,
				},
				400,
			);
		}
		return c.json({
			error: "Internal Server Error",
		});
	}
});

export const handler = handle(app);
