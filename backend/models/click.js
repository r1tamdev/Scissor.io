import mongoose from "mongoose";

const clickSchema = new mongoose.Schema({
  shortId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: "Direct" },
  userAgent: { type: String, default: "" },
  device: { type: String, enum: ["desktop", "mobile", "tablet"], default: "desktop" },
});

export default mongoose.model("click", clickSchema);
