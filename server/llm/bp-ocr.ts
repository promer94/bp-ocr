import { generateObject } from 'ai'
import { doubao } from './doubao';
import { z } from 'zod';

const prompt = `
  请从图片中提取出血压和心率数据，返回一个包含以下字段的JSON对象：
  {
    "systolic": number, // 收缩压，单位为mmHg
    "diastolic": number, // 舒张压，单位为mmHg
    "heartRate": number // 心率，单位为次/分钟
  }
`

export async function bpOcr({ url }: { url: string }) {
  const response = await generateObject({
    model: doubao('doubao-seed-1-6-flash-250828'),
    providerOptions: {
      volcengine: {
        thinking: {
          type: 'disabled'
        }
      },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: new URL(url),
            mediaType: 'image/*',
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
    schema: z.object({
      systolic: z.number().describe('收缩压，单位为mmHg'),
      diastolic: z.number().describe('舒张压，单位为mmHg'),
      heartRate: z.number().describe('心率，单位为次/分钟'),
    }),
  })
  return response;
}