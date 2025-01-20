import stream from "node:stream";
import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	type PutObjectCommandInput,
	S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import { getFileFromDatabase } from "../db/helpers";
import type { MimeType } from "../format";

const ImageBucket =
	Resource.App.stage === "shaikzeeshan"
		? Resource["ImageBucket-dev"].name
		: Resource.ImageBucket.name;
const s3 = new S3Client();

const HOURS = 6;
const ExprireTime = HOURS && 60 * 60 * HOURS;

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

		return getSignedUrl(s3, command, { expiresIn: ExprireTime });
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

		return getSignedUrl(s3, command, { expiresIn: ExprireTime });
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
