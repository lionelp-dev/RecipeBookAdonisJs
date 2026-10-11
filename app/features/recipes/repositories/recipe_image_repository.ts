import string from '@adonisjs/core/helpers/string'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import drive from '@adonisjs/drive/services/main'

export default class DriveRecipeImageRepository {
  async store(image: MultipartFile) {
    const key = `recipes/${string.uuid()}.${image.extname}`

    await image.moveToDisk(key)

    return key
  }

  async storeDataUrl(dataUrl: string) {
    const match = /^data:image\/(jpeg|jpg|png|webp);base64,([a-z0-9+/=]+)$/i.exec(dataUrl)
    if (!match) throw new Error('Le format de l’image générée est invalide')

    const extension = match[1] === 'jpg' ? 'jpeg' : match[1]
    const key = `recipes/${string.uuid()}.${extension}`
    await drive.use().put(key, Buffer.from(match[2], 'base64'))
    return key
  }

  async delete(key: string) {
    await drive.use().delete(key)
  }

  async url(key: string) {
    return drive.use().getUrl(key)
  }
}
