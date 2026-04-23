import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  password: { type: String, default: null }, // bcrypt hashed
}, { timestamps: true });

// TTL index — MongoDB auto-cleans expired docs after some delay
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("url", urlSchema);