import db from '@adonisjs/lucid/services/db'

const RESERVATION_LIFETIME_MS = 15 * 60 * 1000

/**
 * Coordinates AI generations only. Existing recipes deliberately remain outside
 * this table so historical/manual duplicate names are left untouched.
 */
export default class LucidRecipeNameReservationRepository {
  normalize(recipeName: string) {
    return recipeName.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR')
  }

  async reserve(recipeName: string) {
    const normalizedName = this.normalize(recipeName)
    const expiresBefore = new Date(Date.now() - RESERVATION_LIFETIME_MS)

    await db.from('ai_recipe_name_reservations').where('created_at', '<', expiresBefore).delete()

    try {
      await db.table('ai_recipe_name_reservations').insert({
        normalized_name: normalizedName,
        created_at: new Date(),
      })
      return true
    } catch (error) {
      if (error instanceof Error && /unique|constraint/i.test(error.message)) return false
      throw error
    }
  }

  async release(recipeName: string) {
    await db
      .from('ai_recipe_name_reservations')
      .where('normalized_name', this.normalize(recipeName))
      .delete()
  }
}
