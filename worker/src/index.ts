import { Hono } from 'hono'

const app = new Hono()

app.get('/todos', async (c) => {
  const cacheUrl = new URL(c.req.url)
  if (cacheUrl.port === '8787') {
    cacheUrl.port = '3000'
  }

	const request = new Request(
    cacheUrl.toString(),
    {
      headers: c.req.headers,
      body: c.req.body
    }
  )

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
