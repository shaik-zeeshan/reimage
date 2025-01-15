import { Resource } from "sst";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import stream from "node:stream";
import { db } from "../db";
import { filesTable } from "../db/schema";
import { getFileFromDatabase } from "../db/helpers";
import type { MimeType } from "../format";

// const Bucket = Resource["cdn.shaikzeeshan.me"];
const ImageBucket =
	Resource.App.stage === "shaikzeeshan"
		? Resource["ImageBucket-dev"].name
		: Resource.ImageBucket.name;
const s3 = new S3Client();

export function getPublicURL(key: string) {
	return `https://${ImageBucket}/${key}`;
}

export function saveFile(filename: string, mimeType: MimeType) {
	const pass = new stream.PassThrough();

	const params: PutObjectCommandInput = {
		Bucket: ImageBucket,
		Key: filename,
		Body: pass,
		ContentType: mimeType,
	};

	const upload = new Upload({
		params,
		client: s3,
	});

	return { pass, upload };
}
export async function getFileSign(filename: string) {
	try {
		const command = new GetObjectCommand({
			Key: filename,
			Bucket: ImageBucket,
		});

		return getSignedUrl(s3, command, { expiresIn: 60 * 60 * 2 });
	} catch (e) {
		return undefined;
	}
}

export async function getFile(filename: string) {
	try {
		const file = await getFileFromDatabase(filename);

		if (!file) {
			throw new Error("file not found");
		}

		const command = new GetObjectCommand({
			Key: filename,
			Bucket: ImageBucket,
		});

		return getSignedUrl(s3, command, { expiresIn: 60 * 60 * 2 });
	} catch (e) {
		return undefined;
	}
}

export async function deleteFileFromBucket(filename: string) {
	try {
		const command = new DeleteObjectCommand({
			Key: filename,
			Bucket: ImageBucket,
		});

		await s3.send(command);

		return true;
	} catch (e) {
		return false;
	}
}

export async function deleteFilesFromBucket(keys: string[]) {
	try {
		const deleteObject = keys.map((key) => ({
			Key: key,
		}));
		const command = new DeleteObjectsCommand({
			Bucket: ImageBucket,
			Delete: {
				Objects: deleteObject,
			},
		});

		await s3.send(command);

		return true;
	} catch (e) {
		return false;
	}
}
