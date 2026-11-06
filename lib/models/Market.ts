import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { localizedString } from './shared'

const MarketSchema = new Schema(
  {
    name: { type: localizedString(true), required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    area: { type: localizedString(), default: () => ({}) },
    city: { type: localizedString(), default: () => ({}) },
    address: { type: String, default: '' },
    description: { type: localizedString(), default: () => ({}) },
    isActive: { type: Boolean, default: true },
    isDefaultReferenceMarket: { type: Boolean, default: false },
  },
  { timestamps: true },
)

MarketSchema.index({ isActive: 1 })
// At most one default reference market.
MarketSchema.index(
  { isDefaultReferenceMarket: 1 },
  { unique: true, partialFilterExpression: { isDefaultReferenceMarket: true } },
)

export type MarketDoc = InferSchemaType<typeof MarketSchema>

export const Market: Model<MarketDoc> =
  (models.Market as Model<MarketDoc>) || model<MarketDoc>('Market', MarketSchema)
