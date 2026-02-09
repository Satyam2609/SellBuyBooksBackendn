import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "crypto"
import { asyncHandler } from "../utils/asynHandler.js";
import dotenv from "dotenv"
import mongoose from "mongoose";
import { BooksUser } from "../models/Books.js";
import { PaymentOrderdata } from "../models/paymentData.js";

dotenv.config()

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
)


function generateOrderId(){
    const uniqueId = crypto.randomBytes(8).toString("hex")
    const hash = crypto.createHash('sha256')
    hash.update(uniqueId)
    return hash.digest('hex').substring(0 , 20)
}

export const createOrder = async (req, res) => {
  try {
    const { bookscarts , paymentdata } = req.body;
console.log(bookscarts)
console.log("sjfnjfnf",paymentdata.fullName)
    const find = bookscarts.map(
  i => new mongoose.Types.ObjectId(i.bookId)
);

    
    const result = await BooksUser.aggregate([
  {
    $match: {
      _id: { $in: find }
    }
  },
  {
    $addFields: {
      quantity: {
        $let: {
          vars: {
            item: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: bookscarts,
                    as: "cart",
                    cond: {
                      $eq: ["$$cart.bookId", { $toString: "$_id" }]
                    }
                  }
                },
                0
              ]
            }
          },
          in: "$$item.quantity"
        }
      }
    }
  },
  {
    $group: {
      _id: null,
      totalprice: {
        $sum: {
          $multiply: ["$originalPrice", "$quantity"]
        }
      }
    }
  }
]);

const amount = result[0]?.totalprice || 0;
console.log("FINAL AMOUNT:", amount);
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
        order_id:response.data.order_id || "null",
        paymentSessionId:response.data.payment_session_id || "null",
        fullName:paymentdata.fullName,
        email:paymentdata.email,
        phone:paymentdata.phone,
        address:paymentdata.Address,
        BuildingName:paymentdata.BuildingName
        
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
