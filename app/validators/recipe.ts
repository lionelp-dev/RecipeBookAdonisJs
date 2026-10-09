import vine from '@vinejs/vine'

const duration = () => vine.number().withoutDecimals().nonNegative()

const ingredient = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  quantity: vine.number().positive(),
  unit: vine.string().trim().maxLength(50).nullable(),
})

const step = vine.object({
  instruction: vine.string().trim().minLength(1).maxLength(2000),
})

export const recipeValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(100),
  description: vine.string().trim().maxLength(1000).nullable(),
  preparationTime: duration(),
  cookingTime: duration(),
  ingredients: vine.array(ingredient),
  steps: vine.array(step),
  image: vine.file({ size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }).optional(),
  removeImage: vine.boolean().optional(),
})

export const recipePageValidator = vine.create({
  page: vine.number().min(1).withoutDecimals().optional(),
})
