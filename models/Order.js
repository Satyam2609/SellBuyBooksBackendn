import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  date: { type:Number,required: true },
  month: { type: String },year: { type: Number }, 
    order_amount: { type: Number, required: true },
});

export const Order = mongoose.model("Order", orderSchema);