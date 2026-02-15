import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
 BookCart: [
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "BookCart.bookModel"
    },
    quantity: {
      type: Number,
      default: 1
    }
  }
]

});

export const UserCartsBook = mongoose.model("UserCart", cartSchema);
