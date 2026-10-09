import env from '#start/env'

const DEFAULT_OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

export const recipeGenerationConfig = {
  textModel: env.get('OPENROUTER_MODEL', 'openai/gpt-4o-mini'),
  imageModel: env.get('OPENROUTER_IMAGE_MODEL', 'openai/gpt-image-2'),
  apiKey: env.get('OPENROUTER_API_KEY'),
  baseUrl: env.get('OPENROUTER_BASE_URL', DEFAULT_OPENROUTER_BASE_URL),
  temperature: 0.8,
  image: {
    size: '1024x640',
    quality: 'low',
    outputFormat: 'jpeg',
  },
} as const
