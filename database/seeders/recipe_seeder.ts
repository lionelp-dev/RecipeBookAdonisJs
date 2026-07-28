import Recipe from '#models/recipe'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const recipes = await Recipe.all()

    if (recipes.length > 0) return

    await Recipe.createMany([
      {
        name: 'Hachis parmentier',
        description:
          "Un gratin familial composé de viande de bœuf et d'une purée de pommes de terre onctueuse.",
        preparationTime: 30,
        cookingTime: 35,
      },
      {
        name: 'Blanquette de veau',
        description: "Un mijoté de veau accompagné de légumes et d'une sauce blanche crémeuse.",
        preparationTime: 25,
        cookingTime: 90,
      },
      {
        name: 'Gratin dauphinois',
        description:
          "De fines rondelles de pommes de terre cuites lentement dans une crème parfumée à l'ail.",
        preparationTime: 20,
        cookingTime: 60,
      },
      {
        name: 'Croque-monsieur',
        description:
          'Un sandwich chaud et croustillant garni de jambon, de fromage et de béchamel.',
        preparationTime: 10,
        cookingTime: 10,
      },
      {
        name: 'Bœuf bourguignon',
        description:
          'Du bœuf mijoté au vin rouge avec des carottes, des champignons et des petits oignons.',
        preparationTime: 30,
        cookingTime: 180,
      },
      {
        name: 'Galettes de pommes de terre',
        description: 'Des galettes dorées et croustillantes à base de pommes de terre râpées.',
        preparationTime: 20,
        cookingTime: 15,
      },
      {
        name: 'Poulet basquaise',
        description:
          'Du poulet mijoté avec des poivrons, des tomates, des oignons et des aromates.',
        preparationTime: 20,
        cookingTime: 45,
      },
      {
        name: 'Gratin de courgettes',
        description: 'Des courgettes fondantes gratinées au four avec de la crème et du fromage.',
        preparationTime: 15,
        cookingTime: 35,
      },
      {
        name: 'Clafoutis aux cerises',
        description:
          "Un dessert moelleux aux cerises recouvertes d'une pâte légère proche du flan.",
        preparationTime: 15,
        cookingTime: 40,
      },
      {
        name: 'Mousse au chocolat',
        description: 'Une mousse aérienne et gourmande préparée avec du chocolat noir.',
        preparationTime: 20,
        cookingTime: 0,
      },
    ])
  }
}
