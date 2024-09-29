# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

~~Now you'll need to pick a host to deploy it to.~~

See [](#cdk) for how deployment works using AWS CDK

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

## CDK

```sh
npm run build # build for production
cd aws
npm i
npm run cdk deploy # deploy to production
```

### CDK Architecture

When Remix builds `npm run build` with Vite it outputs the following:

- Remix backend server is put in `build/server`, includes backend js.
- Remix frontend assets is put in `build/client`, includes png, css, and frontend js.

**Backend**:

`server.ts` takes the Remix server and wraps it so we can call it from AWS Lambda. 
See [](aws/lib/remix-server.ts). It's only 5 lines of code.

**Frontend**:
The frontend assets, from `public/` and `build/client` are uploaded to an S3 bucket.
See "RemixLambdaFn" [](aws/lib/remix-distribution.ts)

**Backend server** uses AWS Lambda running the `server.ts` file as the handler.
`server.ts` takes the default server provided by Remix and wraps it so that AWS Lambda can call it.

The client png/css/js files are uploaded to an S3 bucket. See the "RemixBucketDeployment" in [](aws/lib/remix-stack.ts)

**Cloudfront**: Finally, they both *fronted* by Cloudformation.

- calls to `<server>/*.png` or `<server>/assets/*` get forwarded to the S3 bucket and are edge-cached
- all other calls go to the AWS Lambda backend

See "RemixCloudfrontDistribution" in [](aws/lib/remix-distribution.ts)

See ./aws/README.md for more info

### CDK Resources

These were helpful in getting the CDK architecture setup:

- [Hosting a Remix Application on AWS with CDK](https://www.benoitpaul.com/blog/aws/remix-hosting-serverless/)
  - [benoitpaul/remix-hosting-serverless-aws](https://github.com/benoitpaul/remix-hosting-serverless-aws)
  - This was a great start but wasn't using Vite
- [devkit-io/create-vite-app-cdk](https://github.com/devkit-io/create-vite-app-cdk)
  - This is probably better, but seemed to have additional complexity.
- [m14t/starter-aws-cdk](https://github.com/m14t/starter-aws-cdk)

## Reveal app/entry files

Deleted app/entry.client.tsx and app/entry.server.tsx after git commit `d8ea5e04e410fb1f6fae4564988f46e8a6522f28`

Get them back with `npx remix reveal`

For more information, see https://remix.run/file-conventions/entry.server