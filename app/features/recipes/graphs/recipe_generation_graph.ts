import { END, START, StateGraph } from '@langchain/langgraph'

import { MAX_RECIPE_GENERATION_ATTEMPTS } from '../constants.js'
import { RecipeGenerationContextSchema } from '../contexts/recipe_graph_context.js'
import { attachImage } from '../node/attach_image.js'
import { checkRecipeDuplicate } from '../node/candidate/check_recipe_duplicate.js'
import { generateRecipe } from '../node/candidate/generate_recipe.js'
import { generateRecipeName } from '../node/candidate/generate_recipe_name.js'
import { releaseRecipeName } from '../node/candidate/release_recipe_name.js'
import { reserveRecipeName } from '../node/candidate/reserve_recipe_name.js'
import { cleanupStoredImage } from '../node/cleanup_stored_image.js'
import { generateImage } from '../node/generate_image.js'
import { markImageGenerationFailed } from '../node/mark_image_generation_failed.js'
import { persistRecipe } from '../node/persist_recipe.js'
import { storeImage } from '../node/store_image.js'
import { RecipeGenerationState } from '../state/recipe_generation_state.js'

export const recipeGenerationGraph = new StateGraph({
  state: RecipeGenerationState,
  context: RecipeGenerationContextSchema,
})
  .addNode('generate_recipe_name', generateRecipeName)
  .addNode('check_recipe_duplicate', checkRecipeDuplicate)
  .addNode('reserve_recipe_name', reserveRecipeName)
  .addNode('generate_recipe', generateRecipe)
  .addNode('persist_recipe', persistRecipe)
  .addNode('release_recipe_name', releaseRecipeName)
  .addNode('generate_image', generateImage)
  .addNode('store_image', storeImage)
  .addNode('attach_image', attachImage)
  .addNode('cleanup_stored_image', cleanupStoredImage)
  .addNode('mark_image_generation_failed', markImageGenerationFailed)
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
  .addEdge('generate_recipe', 'persist_recipe')
  .addEdge('persist_recipe', 'release_recipe_name')
  .addConditionalEdges('release_recipe_name', (s) => (s.generateImages ? 'generate_image' : END), [
    'generate_image',
    END,
  ])
  .addConditionalEdges(
    'generate_image',
    (s) => (s.imageGenerationFailed ? 'mark_image_generation_failed' : 'store_image'),
    ['store_image', 'mark_image_generation_failed']
  )
  .addConditionalEdges(
    'store_image',
    (s) => (s.imageGenerationFailed ? 'mark_image_generation_failed' : 'attach_image'),
    ['attach_image', 'mark_image_generation_failed']
  )
  .addConditionalEdges(
    'attach_image',
    (s) => (s.shouldCleanupImage ? 'cleanup_stored_image' : END),
    ['cleanup_stored_image', END]
  )
  .addEdge('cleanup_stored_image', 'mark_image_generation_failed')
  .addEdge('mark_image_generation_failed', END)
  .compile()
