import env from '#start/env'

import { openRouterConfig } from './openrouter.js'

export const recipeGenerationConfig = {
  ...openRouterConfig,
  textModel: env.get('OPENROUTER_MODEL', 'openai/gpt-4o-mini'),
  temperature: 0.8,
} as const
