import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { localizedList, localizedString, unitSchema } from './shared'

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: localizedString(), default: () => ({}) },
  },
  { _id: false },
)

const ProductSchema = new Schema(
  {
    name: { type: localizedString(true), required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    alternativeNames: { type: localizedList(), default: () => ({}) },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    shortDescription: { type: localizedString(), default: () => ({}) },
    description: { type: localizedString(), default: () => ({}) },
    images: { type: [ImageSchema], default: [] },
    identificationGuide: { type: localizedString(), default: () => ({}) },
    goodQualitySigns: { type: localizedList(), default: () => ({}) },
    warningSigns: { type: localizedList(), default: () => ({}) },
    buyingTips: { type: localizedList(), default: () => ({}) },
    seasonalInformation: { type: localizedString(), default: () => ({}) },
    /** Months (1–12) when the product is in peak season. Empty = available year-round. */
    seasonMonths: { type: [Number], default: [] },
    /** Product variety / type used for filtering inside a category (e.g. river fish, farmed fish). */
    variety: { type: localizedString(), default: () => ({}) },
    defaultUnit: { type: unitSchema, default: () => ({ key: 'kg', bn: 'কেজি', en: 'kg' }) },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    /** Lower-cased, NFC-normalised names used for Bengali/English search. Maintained by the service layer. */
    searchText: { type: String, default: '' },
  },
  { timestamps: true },
)

ProductSchema.index({ categoryId: 1, isPublished: 1 })
ProductSchema.index({ isPublished: 1, isFeatured: 1 })
ProductSchema.index({ isPublished: 1, isPopular: 1 })
ProductSchema.index({ searchText: 1 })
ProductSchema.index(
  {
    'name.bn': 'text',
    'name.en': 'text',
    'alternativeNames.bn': 'text',
    'alternativeNames.en': 'text',
  },
  { default_language: 'none', name: 'product_text_search' },
)

export type ProductDoc = InferSchemaType<typeof ProductSchema>

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>('Product', ProductSchema)
