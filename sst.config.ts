/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "reimage",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "aws",
			providers: {
				aws: {
					profile:
						input.stage === "production"
							? "shaikzeeshan-production"
							: "shaikzeeshan-dev",
				},
			},
		};
	},
	async run() {
		const domain = $dev
			? undefined
			: {
					name: "reimage.shaikzeeshan.me",
					dns: sst.cloudflare.dns({
						proxy: true,
					}),
				};

		// S3 Bucket
		const bucket = $dev
			? new sst.aws.Bucket("ImageBucket-dev")
			: new sst.aws.Bucket("ImageBucket");

		// Database Secret
		const ConnectionURL = new sst.Secret(
			"TURSO_CONNECTION_URL",
			"url used to connect your turso database",
		);
		const AuthToken = new sst.Secret(
			"TURSO_AUTH_TOKEN",
			"auth token to access your database",
		);

		// Drizzle Studio (only in dev mode)
		new sst.x.DevCommand("Studio", {
			link: [ConnectionURL, AuthToken],
			dev: {
				command: "npx drizzle-kit studio",
			},
		});

		// API Gateway
		const api = new sst.aws.ApiGatewayV2("MyApi", {
			domain,
		});

		// Lambda Function (API)
		const lambdaFunction = new sst.aws.Function("Hono", {
			architecture: "arm64",
			handler: "src/index.handler",
			nodejs: {
				install: ["sharp", "@libsql/client"],
			},
			//concurrency: {
			//	provisioned: 10,
			//	reserved: 50,
			//},
			link: [bucket, ConnectionURL, AuthToken],
			//versioning: true,
		});

		api.route("$default", lambdaFunction.arn);

		return {
			api: api.url,
		};
	},
});
