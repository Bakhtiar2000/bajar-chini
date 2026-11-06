import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose'

const AdminUserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type AdminUserDoc = InferSchemaType<typeof AdminUserSchema>

export const AdminUser: Model<AdminUserDoc> =
  (models.AdminUser as Model<AdminUserDoc>) || model<AdminUserDoc>('AdminUser', AdminUserSchema)
