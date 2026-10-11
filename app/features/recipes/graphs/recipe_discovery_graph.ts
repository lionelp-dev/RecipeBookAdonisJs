import { END, START, StateGraph } from '@langchain/langgraph'

import { MAX_RECIPE_GENERATION_ATTEMPTS } from '../constants.js'
import { RecipeDiscoveryContextSchema } from '../contexts/recipe_graph_context.js'
import { checkRecipeDuplicate } from '../node/candidate/check_recipe_duplicate.js'
import { generateRecipe } from '../node/candidate/generate_recipe.js'
import { generateRecipeName } from '../node/candidate/generate_recipe_name.js'
import { releaseRecipeName } from '../node/candidate/release_recipe_name.js'
import { reserveRecipeName } from '../node/candidate/reserve_recipe_name.js'
import { generateImage } from '../node/generate_image.js'
import { RecipeDiscoveryState } from '../state/recipe_discovery_state.js'

export const recipeDiscoveryGraph = new StateGraph({
  state: RecipeDiscoveryState,
  context: RecipeDiscoveryContextSchema,
})
  .addNode('generate_recipe_name', generateRecipeName)
  .addNode('check_recipe_duplicate', checkRecipeDuplicate)
  .addNode('reserve_recipe_name', reserveRecipeName)
  .addNode('generate_recipe', generateRecipe)
  .addNode('generate_image', generateImage)
  .addNode('release_recipe_name', releaseRecipeName)
  .addEdge(START, 'generate_recipe_name')
  .addEdge('generate_recipe_name', 'check_recipe_duplicate')
  .addConditionalEdges(
    'check_recipe_duplicate',
    (s) =>
      !s.isDuplicateRecipe
        ? 'reserve_recipe_name'
        : s.generationAttempts < MAX_RECIPE_GENERATION_ATTEMPTS
          ? 'generate_recipe_name'
          : END,
    ['generate_recipe_name', 'reserve_recipe_name', END]
  )
  .addConditionalEdges(
    'reserve_recipe_name',
    (s) =>
      s.hasReservedRecipeName
        ? 'generate_recipe'
        : s.generationAttempts < MAX_RECIPE_GENERATION_ATTEMPTS
          ? 'generate_recipe_name'
          : END,
    ['generate_recipe_name', 'generate_recipe', END]
  )
  .addEdge('generate_recipe', 'generate_image')
  .addEdge('generate_image', 'release_recipe_name')
  .addEdge('release_recipe_name', END)
  .compile()
