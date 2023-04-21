import { Hono, HonoRequest } from 'hono'

type Bindings = {
  ISR_CACHE: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

const createOriginRequest = (req: HonoRequest<any>, pathname?: string) => {
  const originUrl = new URL(req.url)
  if (originUrl.port === '8787') {
    originUrl.port = '3000'
  }

  if (pathname) {
    originUrl.pathname = pathname
  }

	return new Request(
    originUrl.toString(),
    {
      headers: req.headers,
      body: req.body
    }
  )
}

const restoreResponse = ({ body, headers }: { body: string, headers: HeadersInit, }) => {
  return new Response(body, { headers })
}

const createCache = async (CACHE_KV: KVNamespace, cacheKey: Request, response: Response) => {
  const cacheTtl = new Date()
  cacheTtl.setSeconds(cacheTtl.getSeconds() + 60)

  const headerJson: {[key: string]: string} = {}
  response.headers.forEach((value, key) => headerJson[key] = value)

  await CACHE_KV.put(
    `${cacheKey.url}`,
    JSON.stringify({
      headers: headerJson,
      body: await response.text(),
      cacheTtl: cacheTtl.getTime(),
    }),
    {
      expirationTtl: 60 * 60 * 24 * 365
    }
  )
}

app.get('/isr_todos', async (c) => {
  const request = createOriginRequest(c.req, '/todos')

  const cacheResponseJson = await c.env.ISR_CACHE.get<{
    headers: HeadersInit,
    body: string,
    cacheTtl: number,
  }>(
    `${request.url}`,
    { type: 'json' }
  )

  let response: Response
  let isCreateCache = false

  if (!cacheResponseJson) {
    console.log(`no KV Cache hit for: ${request.url}.`)
    response = await fetch(request)
    isCreateCache = true
  } else {
    console.log(`KV Cache hit for: ${request.url}.`)

    response = restoreResponse(cacheResponseJson)
    if (new Date().getTime() > cacheResponseJson.cacheTtl) {
      console.log(`KV Cache has expired.`)
      isCreateCache = true
    }
  }

  if (isCreateCache) {
    c.executionCtx.waitUntil(createCache(c.env.ISR_CACHE, request, response.clone() ?? await fetch(request)))
  }

  return response
})

app.get('/todos', async (c) => {
	const request = createOriginRequest(c.req)

  const cache = caches.default

  let response = await cache.match(request)

  if (!response) {
    console.log(`Response for request url: ${c.req.url} not present in cache. Fetching and caching request.`)
    response = await fetch(request)

    response = new Response(response.body, response)
    response.headers.set("Cache-Control", "s-maxage=30")

    c.executionCtx.waitUntil(cache.put(request, response.clone()))
  } else {
    console.log(`Cache hit for: ${request.url}.`)
  }

  return response
})

app.all('/*', async (c) => {
  const url = new URL(c.req.url)

  if (url.port === '8787') {
    url.port = '3000'
  }

  return await fetch(
    url.toString(),
    {
      headers: c.req.headers,
      body: c.req.body
    }
  )
})

export default app
