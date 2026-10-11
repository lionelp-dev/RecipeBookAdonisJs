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

const RecipeGenerationController = () => import('#controllers/recipe_generation_controller')
const RecipeDiscoveryController = () => import('#controllers/recipe_discovery_controller')

router.get('/', [controllers.Recipes, 'index']).as('home')
router.get('/recipes/new', [controllers.Recipes, 'create']).as('recipes.create')
router.post('/recipes', [controllers.Recipes, 'store']).as('recipes.store')
router.post('/recipes/generate', [RecipeGenerationController, 'store']).as('recipes.generate')
router.get('/recipes/discover', ({ response }) => response.redirect().toRoute('home'))
router.get('/recipes/discover/pool', ({ response }) => response.redirect().toRoute('home'))
router.get('/recipes/discover/save', ({ response }) => response.redirect().toRoute('home'))
router.post('/recipes/discover/pool', [RecipeDiscoveryController, 'pool'])
router.post('/recipes/discover/save', [RecipeDiscoveryController, 'save'])
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
