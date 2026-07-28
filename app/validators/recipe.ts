import vine from '@vinejs/vine'

const duration = () => vine.number().withoutDecimals().nonNegative()

export const recipeValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  description: vine.string().trim().maxLength(1000).nullable(),
  preparationTime: duration(),
  cookingTime: duration(),
})
