import { Hono } from 'hono'
import { uploadBodyImageToS3 } from './s3'
import { bpOcr } from './llm/bp-ocr'

const app = new Hono().basePath('/api')


app.get('/', async (c) => {
  return c.text('record your bp')
})

app.post('/upload', uploadBodyImageToS3(), async (c) => {
  const imageUrl = c.get('imageS3Url')
  const result = await bpOcr({ url: imageUrl })
  return c.json(result.object)
})

export { app }
