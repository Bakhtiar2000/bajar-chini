import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { localizedString } from './shared'

const ArticleSchema = new Schema(
  {
    title: { type: localizedString(true), required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: localizedString(), default: () => ({}) },
    content: { type: localizedString(), default: () => ({}) },
    coverImage: { type: String, default: '' },
    coverImagePublicId: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

ArticleSchema.index({ isPublished: 1, publishedAt: -1 })
ArticleSchema.index({ categoryId: 1 })

export type ArticleDoc = InferSchemaType<typeof ArticleSchema>

export const Article: Model<ArticleDoc> =
  (models.Article as Model<ArticleDoc>) || model<ArticleDoc>('Article', ArticleSchema)
