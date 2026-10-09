import { test } from '@japa/runner'

import { createRecipeGenerationGraph } from '#services/recipe-generation/recipe_generation_graph'

const generatedRecipe = {
  name: 'Risotto aux champignons',
  description: 'Un risotto crémeux.',
  preparationTime: 15,
  cookingTime: 25,
  ingredients: [{ name: 'Riz arborio', quantity: 300, unit: 'g' }],
  steps: [{ instruction: 'Cuire le riz jusqu’à ce qu’il soit crémeux.' }],
}

test.group('Recipe generation graph', () => {
  test('persists the recipe before generating its image', async ({ assert }) => {
    const executedSteps: string[] = []
    const graph = createRecipeGenerationGraph({
      generateRecipeName: async () => {
        executedSteps.push('generate_recipe_name')
        return { name: generatedRecipe.name }
      },
      recipeNameExists: async () => false,
      reserveRecipeName: async () => true,
      releaseRecipeName: async () => {
        executedSteps.push('release_recipe_name')
      },
      generateRecipe: async () => {
        executedSteps.push('generate_recipe')
        return generatedRecipe
      },
      persistRecipe: async () => {
        executedSteps.push('persist_recipe')
        return { id: 42 }
      },
      generateImage: async () => {
        executedSteps.push('generate_image')
        return 'data:image/jpeg;base64,aW1hZ2U='
      },
      storeImage: async () => {
        executedSteps.push('store_image')
        return 'recipes/42.jpeg'
      },
      attachImage: async () => {
        executedSteps.push('attach_image')
      },
      markImageGenerationFailed: async () => {
        executedSteps.push('mark_image_generation_failed')
      },
      deleteImage: async () => {
        executedSteps.push('delete_image')
      },
    })

    const result = await graph.invoke({ prompt: 'Un risotto', generateImages: true })

    assert.equal(result.persistedRecipeId, 42)
    assert.deepEqual(executedSteps, [
      'generate_recipe_name',
      'generate_recipe',
      'persist_recipe',
      'release_recipe_name',
      'generate_image',
      'store_image',
      'attach_image',
    ])
  })

  test('removes a stored image when its attachment fails', async ({ assert }) => {
    const deletedImageKeys: string[] = []
    const graph = createRecipeGenerationGraph({
      generateRecipeName: async () => ({ name: generatedRecipe.name }),
      recipeNameExists: async () => false,
      reserveRecipeName: async () => true,
      releaseRecipeName: async () => undefined,
      generateRecipe: async () => generatedRecipe,
      persistRecipe: async () => ({ id: 42 }),
      generateImage: async () => 'data:image/jpeg;base64,aW1hZ2U=',
      storeImage: async () => 'recipes/42.jpeg',
      attachImage: async () => {
        throw new Error('Database unavailable')
      },
      markImageGenerationFailed: async () => undefined,
      deleteImage: async (imageKey) => {
        deletedImageKeys.push(imageKey)
      },
    })

    const result = await graph.invoke({ prompt: 'Un risotto', generateImages: true })

    assert.equal(result.persistedRecipeId, 42)
    assert.deepEqual(deletedImageKeys, ['recipes/42.jpeg'])
  })

  test('retries generation when the proposed recipe name already exists', async ({ assert }) => {
    const generatedRecipeNames: string[] = []
    const generatedRecipes: string[] = []
    const graph = createRecipeGenerationGraph({
      generateRecipeName: async (_, excludedRecipeNames) => {
        const recipeName = excludedRecipeNames.length
          ? 'Risotto aux poireaux'
          : generatedRecipe.name
        generatedRecipeNames.push(recipeName)
        return { name: recipeName }
      },
      recipeNameExists: async (recipeName) => recipeName === generatedRecipe.name,
      reserveRecipeName: async () => true,
      releaseRecipeName: async () => undefined,
      generateRecipe: async (_, recipeName) => {
        generatedRecipes.push(recipeName)
        return { ...generatedRecipe, name: recipeName }
      },
      persistRecipe: async () => ({ id: 43 }),
      generateImage: async () => null,
      storeImage: async () => 'unused',
      attachImage: async () => undefined,
      markImageGenerationFailed: async () => undefined,
      deleteImage: async () => undefined,
    })

    const result = await graph.invoke({ prompt: 'Un risotto', generateImages: false })

    assert.equal(result.persistedRecipeId, 43)
    assert.deepEqual(generatedRecipeNames, ['Risotto aux champignons', 'Risotto aux poireaux'])
    assert.deepEqual(generatedRecipes, ['Risotto aux poireaux'])
  })

  test('lets concurrent graphs reserve a shared name only once, then regenerate', async ({
    assert,
  }) => {
    const reservedNames = new Set<string>()
    const persistedNames: string[] = []
    const createGraph = () =>
      createRecipeGenerationGraph({
        generateRecipeName: async (_, excludedRecipeNames) => ({
          name: excludedRecipeNames.length ? 'Risotto aux poireaux' : generatedRecipe.name,
        }),
        recipeNameExists: async () => false,
        reserveRecipeName: async (recipeName) => {
          if (reservedNames.has(recipeName)) return false
          reservedNames.add(recipeName)
          return true
        },
        releaseRecipeName: async (recipeName) => {
          reservedNames.delete(recipeName)
        },
        generateRecipe: async (_, recipeName) => ({ ...generatedRecipe, name: recipeName }),
        persistRecipe: async (recipe) => {
          persistedNames.push(recipe.name)
          return { id: persistedNames.length }
        },
        generateImage: async () => null,
        storeImage: async () => 'unused',
        attachImage: async () => undefined,
        markImageGenerationFailed: async () => undefined,
        deleteImage: async () => undefined,
      })

    const [first, second] = await Promise.all([
      createGraph().invoke({ prompt: 'Un risotto', generateImages: false }),
      createGraph().invoke({ prompt: 'Un risotto', generateImages: false }),
    ])

    assert.exists(first.persistedRecipeId)
    assert.exists(second.persistedRecipeId)
    assert.deepEqual(persistedNames.sort(), ['Risotto aux champignons', 'Risotto aux poireaux'])
    assert.equal(reservedNames.size, 0)
  })
})
