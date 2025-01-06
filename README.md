# Reimage

image optimization using AWS S3 and Cloudflare CDN

## Stack

- [Hono](https://hono.dev/)
- [Turso (libsql)](https://turso.tech/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Cloudflare CDN](https://www.cloudflare.com/en-in/application-services/products/cdn/)

## Step

### Step 1 : Setup SST dev

Setup [SST](https://sst.dev) with aws

### Step 2 : Set Secret using `sst secret`

Set `TURSO_CONNECTION_URL` secret

```
sst secret set TURSO_CONNECTION_URL <database_url>
```

Set `TURSO_AUTH_TOKEN` secret

```
sst secret set TURSO_AUTH_TOKEN <auth_token>
```

### Step 4 : Check if Cloudflare Cache is Setup

- Go to Account Home , Select the domain name where app is deployed
- Select Cache and go to Cache Rules
- Choose Cache Everything template and deploy

### Step 3 : Run dev check if everything fine

```
sst dev
```

### Step 4 : Deploy with your stage

```
sst deploy --stage <stage_name>
```
