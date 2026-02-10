import { BooksUser } from "../models/Books.js";
import { UserCartsBook } from "../models/Cart.js";
import { PaymentOrderdata } from "../models/paymentData.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asynHandler.js";
import dotenv from "dotenv"

const adminsignUp = asyncHandler(async(req , res) => {
    const {email , password} = req.body
    console.log(email , password)

    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"Please provide email and password"
        })
    }

    if(email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD){
        return res.status(401).json({
            success:false,
            message:"Invalid email or password"
        })
    }
    
    return res.status(200).json({
        success:true,
        message:"Admin login successful"
    })
})
const ordersDetails = asyncHandler(async (req, res) => {
  const findPayment = await PaymentOrderdata.find();
  const orders = findPayment.flatMap(order => order.orderData);

  const findBooks = await BooksUser.find({
    _id: { $in: orders.map(o => o.bookId) }
  });
  console.log(findBooks)

  let total = 0;

  for (let order of orders) {
    const book = findBooks.find(
      b => b._id.toString() === order.bookId.toString()
    );
console.log("book:", book)
    if (!book) continue;

    total += book.originalPrice * order.quantity;
    console.log("total:", total);
  }

  const findUserCount = await User.countDocuments();

  const userActiveCount = await User.countDocuments({ isActive: true });


  return res.status(200).json({
    success: true,
    total,
    findUserCount,
    userActiveCount
  });
});

const ordersdatas = asyncHandler(async(req , res) => {
    const findBooks = await BooksUser.find()
    const booksCount = await BooksUser.countDocuments()
    console.log(findBooks)
    if(!findBooks){
        return res.status(401).json({
            success:false,
            message:"Books not found"
        })
    }
    
    return res.status(200).json({
        success:true,
        findBooks,
        booksCount
    })
})

export {
    adminsignUp,
    ordersDetails,
    ordersdatas
}
