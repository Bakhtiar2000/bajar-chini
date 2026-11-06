import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'
import { unitSchema } from './shared'

const PriceRecordSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    minimumPrice: { type: Number, required: true, min: 0 },
    maximumPrice: { type: Number, required: true, min: 0 },
    /** Midpoint of min and max. Always calculated on the server. */
    referencePrice: { type: Number, required: true, min: 0 },
    unit: { type: unitSchema, required: true },
    currency: { type: String, enum: ['BDT'], default: 'BDT' },
    sourceType: {
      type: String,
      enum: ['MANUAL_OBSERVATION', 'OFFICIAL_SOURCE', 'CONTRIBUTOR_SUBMISSION'],
      default: 'MANUAL_OBSERVATION',
    },
    sourceDescription: { type: String, default: '' },
    notes: { type: String, default: '' },
    /** The actual day the price was observed at the market. */
    observedAt: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
    publishedAt: { type: Date, default: null },
    /** Illustrative seed values. Never presented as genuine observations. */
    isDemo: { type: Boolean, default: false },
    createdBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true },
)

PriceRecordSchema.pre('validate', function () {
  if (typeof this.minimumPrice === 'number' && typeof this.maximumPrice === 'number') {
    if (this.minimumPrice > this.maximumPrice) {
      this.invalidate('minimumPrice', 'Minimum price cannot exceed maximum price')
    }
    this.referencePrice = Math.round(((this.minimumPrice + this.maximumPrice) / 2) * 100) / 100
  }
})

// One observation per product, per market, per calendar month.
PriceRecordSchema.index({ productId: 1, marketId: 1, month: 1, year: 1 }, { unique: true })
PriceRecordSchema.index({ marketId: 1, year: -1, month: -1, status: 1 })
PriceRecordSchema.index({ productId: 1, marketId: 1, status: 1, year: -1, month: -1 })
PriceRecordSchema.index({ status: 1, year: -1, month: -1 })

export type PriceRecordDoc = InferSchemaType<typeof PriceRecordSchema>

export const PriceRecord: Model<PriceRecordDoc> =
  (models.PriceRecord as Model<PriceRecordDoc>) ||
  model<PriceRecordDoc>('PriceRecord', PriceRecordSchema)
