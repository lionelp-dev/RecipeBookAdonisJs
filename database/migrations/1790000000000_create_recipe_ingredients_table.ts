import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipe_ingredients'

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
      table.string('name', 100).notNullable()
      table.decimal('quantity', 10, 2).notNullable()
      table.string('unit', 50).nullable()
      table.integer('position').notNullable()
      table.index(['recipe_id', 'position'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
