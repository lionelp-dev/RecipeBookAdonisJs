import env from '#start/env'

const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export const openRouterConfig = {
  apiKey: env.get('OPENROUTER_API_KEY'),
  baseUrl: env.get('OPENROUTER_BASE_URL', DEFAULT_OPENROUTER_BASE_URL),
} as const
