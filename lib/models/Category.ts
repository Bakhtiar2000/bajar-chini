import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { localizedString } from './shared'

const CategorySchema = new Schema(
  {
    name: { type: localizedString(true), required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: localizedString(), default: () => ({}) },
    image: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: '' },
    icon: {
      type: String,
      enum: [
        'fish',
        'chicken',
        'beef',
        'mutton',
        'vegetable',
        'leafy',
        'fruit',
        'spice',
        'grain',
        'other',
      ],
      default: 'other',
    },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

CategorySchema.index({ isActive: 1, displayOrder: 1 })
CategorySchema.index({ 'name.bn': 1 })
CategorySchema.index({ 'name.en': 1 })

export type CategoryDoc = InferSchemaType<typeof CategorySchema>

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>('Category', CategorySchema)
