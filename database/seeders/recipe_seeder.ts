import Recipe from '#models/recipe'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { recipes } from './data/recipes.js'

export default class extends BaseSeeder {
  async run() {
    for (const fixture of recipes) {
      const existing = await Recipe.query()
        .where('name', fixture.name)
        .preload('ingredients')
        .first()

      if (existing?.ingredients.length) continue

      const recipe = existing ?? new Recipe()
      recipe.merge({
        name: fixture.name,
        description: fixture.description,
        preparationTime: fixture.preparationTime,
        cookingTime: fixture.cookingTime,
      })
      await recipe.save()
      await recipe.related('ingredients').createMany(
        fixture.ingredients.map(([name, quantity, unit], position) => ({ name, quantity, unit, position }))
      )
    }
  }
}
