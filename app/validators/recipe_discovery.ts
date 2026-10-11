import vine from '@vinejs/vine'

const generatedIngredient = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  quantity: vine.number().positive(),
  unit: vine.string().trim().maxLength(50).nullable(),
})

const generatedStep = vine.object({
  instruction: vine.string().trim().minLength(1).maxLength(2000),
})

const generatedRecipe = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  description: vine.string().trim().maxLength(1000).nullable(),
  preparationTime: vine.number().withoutDecimals().nonNegative(),
  cookingTime: vine.number().withoutDecimals().nonNegative(),
  ingredients: vine.array(generatedIngredient),
  steps: vine.array(generatedStep).minLength(1),
})

export const recipeDiscoveryPoolValidator = vine.create({
  prompt: vine.string().trim().minLength(3).maxLength(5000),
})

export const saveDiscoveredRecipeValidator = vine.create({
  recipe: generatedRecipe,
  imageDataUrl: vine.string().nullable(),
})
