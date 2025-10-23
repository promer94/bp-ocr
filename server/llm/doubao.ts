import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const doubao = createOpenAICompatible({
  name: 'volcengine',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: process.env.VOLCENGINE_API_KEY || '',
  supportsStructuredOutputs: true,
})