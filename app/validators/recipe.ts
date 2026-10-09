import vine from '@vinejs/vine'

const duration = () => vine.number().withoutDecimals().nonNegative()

const ingredient = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  quantity: vine.number().positive(),
  unit: vine.string().trim().maxLength(50).nullable(),
})

export const recipeValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
  description: vine.string().trim().maxLength(1000).nullable(),
  preparationTime: duration(),
  cookingTime: duration(),
  ingredients: vine.array(ingredient),
})

export const recipePageValidator = vine.create({
  page: vine.number().min(1).withoutDecimals().optional(),
})
