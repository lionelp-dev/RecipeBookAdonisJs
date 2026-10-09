import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('image_generation_status').notNullable().defaultTo('not_requested')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('image_generation_status')
    })
  }
}
