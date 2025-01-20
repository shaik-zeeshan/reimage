import type { Sharp } from "sharp";
import { z } from "zod";
import { zodImageFormat } from "../format";

const string = z.string();

const resizeFit = z.enum(["contain", "cover", "fill", "inside", "outside"]);

export const sharpQueryOptions = z
	.object({
		url: string.url(),
		rotate: z.coerce.number().optional(),
		gray: z.coerce.boolean().optional(),
		grey: z.coerce.boolean().optional(),
		format: zodImageFormat.optional().default("jpeg"),
		quality: z.coerce.number().lte(100).optional(),
		progressive: z.coerce.boolean().optional(),
		mozjpeg: z.coerce.boolean().optional(),
		width: z.coerce.number().optional(),
		height: z.coerce.number().optional(),
		fit: resizeFit.optional().default("cover"),
	})
	.superRefine((values, context) => {
		if (values.format !== "jpeg" && values.mozjpeg) {
			return context.addIssue({
				code: z.ZodIssueCode.custom,
				message: "mozjpeg can only be used when format is jpeg",
				path: ["mozjpeg"],
			});
		}
	});

export type SharpQueryType = z.infer<typeof sharpQueryOptions>;

export function createSharpTransformer(sharp: Sharp, options: SharpQueryType) {
	if (options.gray) {
		sharp.grayscale(options.gray);
	}

	if (options.grey) {
		sharp.greyscale(options.grey);
	}

	if (options.rotate) {
		sharp.rotate(options.rotate);
	}

	sharp.toFormat(options.format, {
		...(options.quality && { quality: options.quality }),
		...(options.progressive && { progressive: options.progressive }),
		...(options.mozjpeg &&
			options.format === "jpeg" && { progressive: options.progressive }),
	});

	if (options.width || options.height) {
		sharp.resize(options.width, options.height, {
			fit: options.fit,
		});
	}

	return sharp;
}
