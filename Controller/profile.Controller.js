import { asyncHandler } from "../utils/asynHandler.js";
import { User } from "../models/User.js";
import { UserCartsBook } from "../models/Cart.js";
import { BooksUser } from "../models/Books.js";
import uploadCloudinary from "../utils/cloudinary.js";

const cartCreate = asyncHandler(async (req, res) => {
  const { bookId, quantity } = req.body;

  if (!bookId) {
    return res.status(400).json({
      success: false,
      message: "BookId is required",
    });
  }

  const email = req.user.email;

  // 🔎 Book DB se lao
  const book = await BooksUser.findById(bookId);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }

  let cart = await UserCartsBook.findOne({ email });

  if (cart) {
    const already = cart.BookCart.find(
      (item) => item.bookId.toString() === bookId
    );

    if (already) {
      already.quantity += quantity || 1;
    } else {
      cart.BookCart.push({
        bookId: book._id,
        quantity: quantity || 1,
      });
    }

    await cart.save();
  } else {
    cart = await UserCartsBook.create({
      email,
      BookCart: [
        {
          bookId: book._id,
          quantity: quantity || 1,
        },
      ],
    });
  }

  res.status(200).json({
    success: true,
    message: "Added to cart",
    cart,
  });
});

const getCart = asyncHandler(async (req, res) => {
  const email = req.user.email;

  const cart = await UserCartsBook
    .findOne({ email })
    .populate("BookCart.bookId"); // 🔥 MOST IMPORTANT LINE

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    cart,
  });
});

const deletecart = asyncHandler(async(req , res) => {
  const email = req.user.email
  const {cartId} = req.body
  console.log("cart",cartId)
  const findCart = await UserCartsBook.findOne({email})
  findCart.BookCart = findCart.BookCart.filter(
  item => item.bookId.toString() !== cartId
);
await findCart.save()

res.status(200).json({
  success:true
})
})



const getprofile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(userId)

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json(user);
});

export {
    getprofile,
    cartCreate,
    getCart,
    deletecart
}