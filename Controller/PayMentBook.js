import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "crypto"
import { asyncHandler } from "../utils/asynHandler.js";
import dotenv from "dotenv"
import mongoose from "mongoose";
import { BooksUser } from "../models/Books.js";
import { sellBookData } from "../models/SellBookImage.js";
import { PaymentOrderdata } from "../models/paymentData.js";

dotenv.config()

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET
)


function generateOrderId() {
  const uniqueId = crypto.randomBytes(8).toString("hex")
  const hash = crypto.createHash('sha256')
  hash.update(uniqueId)
  return hash.digest('hex').substring(0, 20)
}

export const createOrder = async (req, res) => {
  try {
    const { bookscarts, paymentdata } = req.body;

    console.log("mdskf", bookscarts)
    console.log("sjfnjfnf")
    // bookscarts can be an array of IDs or an array of {bookId, quantity} objects
    const extractId = (item) => (typeof item === 'string' ? item : item.bookId);
    const extractQty = (item) => (typeof item === 'string' ? 1 : (item.quantity || 1));

    const bookIds = bookscarts.map(i => new mongoose.Types.ObjectId(extractId(i)));

    // Search in both collections
    const books = await BooksUser.find({ _id: { $in: bookIds } });
    const sellBooks = await sellBookData.find({ _id: { $in: bookIds } });
    const allBooksFound = [...books, ...sellBooks];

    let amount = 0;
    allBooksFound.forEach(book => {
      const cartItem = bookscarts.find(i => extractId(i) === book._id.toString());
      const quantity = extractQty(cartItem);
      const price = book.originalPrice || book.price || 0;
      amount += (Number(price) * Number(quantity));
    });

    console.log("FINAL CALCULATED  AMOUNT:", amount);
    const userId = req.user._id


    const request = {
      order_id: generateOrderId(),
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: paymentdata.fullName,
        customer_email: paymentdata.email,
        customer_phone: paymentdata.phone,
      }
    };

    const response = await cashfree.PGCreateOrder(request);

    const payment = await PaymentOrderdata.create({
      useremail: req.user.email,
      order_id: response.data.order_id || "null",
      paymentSessionId: response.data.payment_session_id || "null",
      fullName: paymentdata.fullName,
      email: paymentdata.email,
      phone: paymentdata.phone,
      address: paymentdata.Address,
      BuildingName: paymentdata.BuildingName,
      orderData: bookscarts.map(i => ({
        bookId: extractId(i),
        quantity: extractQty(i)
      }))

    })

    res.json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
