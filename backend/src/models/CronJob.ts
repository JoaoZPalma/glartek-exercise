import mongoose, { Schema, Document } from "mongoose";

export interface ICronJob extends Document {
  name?: string;
  uri: string;
  httpMethod: string;
  body?: string;
  schedule: string;
  timeZone: string;
  enabled: boolean;
  lockedUntil?: Date;
}

const CronJobSchema = new Schema<ICronJob>({
  name: String,
  uri: { type: String, required: true },
  httpMethod: { type: String, required: true },
  body: String,
  schedule: { type: String, required: true },
  timeZone: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  lockedUntil: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<ICronJob>("CronJob", CronJobSchema);
