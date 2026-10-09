import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipe_steps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('recipe_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('recipes')
        .onDelete('CASCADE')
      table.text('instruction').notNullable()
      table.integer('position').notNullable()
      table.index(['recipe_id', 'position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
