import { Schema } from 'mongoose'

export const localizedString = (required = false) =>
  new Schema(
    {
      bn: { type: String, trim: true, default: '', required },
      en: { type: String, trim: true, default: '', required },
    },
    { _id: false },
  )

export const localizedList = () =>
  new Schema(
    {
      bn: { type: [String], default: [] },
      en: { type: [String], default: [] },
    },
    { _id: false },
  )

export const unitSchema = new Schema(
  {
    key: { type: String, required: true },
    bn: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false },
)
