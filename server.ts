import { createRequestHandler} from "@remix-run/architect";

export const handler = createRequestHandler({
  build: require('./build/server'),
  mode: process.env.NODE_ENV
})