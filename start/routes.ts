/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.get('/', [controllers.Recipes, 'index']).as('home')
router.get('/recipes/new', [controllers.Recipes, 'create']).as('recipes.create')
router.post('/recipes', [controllers.Recipes, 'store']).as('recipes.store')
router.get('/recipes/:id/edit', [controllers.Recipes, 'edit']).as('recipes.edit')
router.patch('/recipes/:id', [controllers.Recipes, 'update']).as('recipes.update')
router.delete('/recipes/:id', [controllers.Recipes, 'destroy']).as('recipes.destroy')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
