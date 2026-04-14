import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  date: { type: Number, required: true },
  month: { type: String },
  year: { type: Number },
  fullDate: { type: Date, default: Date.now },
  order_amount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);