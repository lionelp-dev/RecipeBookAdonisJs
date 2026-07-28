/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  recipes: {
    create: typeof routes['recipes.create']
    store: typeof routes['recipes.store']
    edit: typeof routes['recipes.edit']
    update: typeof routes['recipes.update']
    destroy: typeof routes['recipes.destroy']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
}
