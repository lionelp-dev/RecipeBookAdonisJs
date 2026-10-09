import { recipeGenerationConfig } from '#services/recipe-generation/recipe_generation_config'

export default class RecipeImageGenerationService {
  async generate(recipeName: string): Promise<string | null> {
    const { apiKey, baseUrl, image: imageConfig, imageModel } = recipeGenerationConfig
    if (!apiKey) return null

    try {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: imageModel,
          prompt: `Professional food photography of ${recipeName}, appetizing, well-lit, realistic, no text or watermark`,
          n: 1,
          size: imageConfig.size,
          quality: imageConfig.quality,
          output_format: imageConfig.outputFormat,
        }),
      })
      if (!response.ok) return null

      const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> }
      const image = payload.data?.[0]?.b64_json
      return image ? `data:image/jpeg;base64,${image}` : null
    } catch {
      return null
    }
  }
}
