import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  title: String,
  brandName: String,
  image: String,

  originalPrice: Number,
  discountPrice: Number,

  condition: {
    type: String,
    default: "new"
  }
});

export const BooksUser = mongoose.model("Booksdata" , BookSchema)