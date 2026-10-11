import env from '#start/env'

import { openRouterConfig } from './openrouter.js'

export const imageGenerationConfig = {
  ...openRouterConfig,
  model: env.get('OPENROUTER_IMAGE_MODEL', 'openai/gpt-image-2'),
  size: '1024x640',
  quality: 'low',
  outputFormat: 'jpeg',
} as const
