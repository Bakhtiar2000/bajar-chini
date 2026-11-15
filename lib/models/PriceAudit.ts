import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

/**
 * Append-only history of every change to monthly price records: who changed
 * what, when, and the values before and after. Never updated or deleted by
 * the application.
 */
const SnapshotSchema = new Schema(
  {
    minimumPrice: Number,
    maximumPrice: Number,
    referencePrice: Number,
    unit: String,
    notes: String,
    status: String,
    observedAt: Date,
    isDemo: Boolean,
  },
  { _id: false },
)

const PriceAuditSchema = new Schema(
  {
    action: {
      type: String,
      enum: ['create', 'update', 'publish', 'unpublish', 'delete'],
      required: true,
    },
    recordId: { type: Schema.Types.ObjectId, ref: 'PriceRecord', default: null },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    marketId: { type: Schema.Types.ObjectId, ref: 'Market', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    actor: { type: String, required: true },
    actorRole: { type: String, default: '' },
    /** Where the change came from: bulk editor, CSV import, single correction… */
    source: { type: String, default: '' },
    before: { type: SnapshotSchema, default: null },
    after: { type: SnapshotSchema, default: null },
    /** True when the change affected a record that was publicly visible. */
    wasPublished: { type: Boolean, default: false },
    at: { type: Date, default: () => new Date() },
  },
  { versionKey: false },
)

PriceAuditSchema.index({ at: -1 })
PriceAuditSchema.index({ productId: 1, marketId: 1, at: -1 })
PriceAuditSchema.index({ marketId: 1, year: -1, month: -1, at: -1 })
PriceAuditSchema.index({ actor: 1, at: -1 })

export type PriceAuditDoc = InferSchemaType<typeof PriceAuditSchema>

export const PriceAudit: Model<PriceAuditDoc> =
  (models.PriceAudit as Model<PriceAuditDoc>) ||
  model<PriceAuditDoc>('PriceAudit', PriceAuditSchema)
