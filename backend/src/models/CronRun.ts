import mongoose, { Schema, Document } from "mongoose";

export interface ICronRun extends Document {
  cronId: mongoose.Types.ObjectId;
  scheduledFor: Date;
  executedAt?: Date;
  status: string;
  responseStatus?: number;
  responseBody?: string;
  attempts: number;
}

const CronRunSchema = new Schema<ICronRun>({
  cronId: { type: Schema.Types.ObjectId, ref: "CronJob", required: true },
  scheduledFor: Date,
  executedAt: Date,
  status: String,
  responseStatus: Number,
  responseBody: String,
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<ICronRun>("CronRun", CronRunSchema);
