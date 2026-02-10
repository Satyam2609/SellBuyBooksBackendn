import mongoose from "mongoose";

const paymentSceham = new mongoose.Schema({
    useremail:{
        type:String,
        required:true
    },
    order_id:{
        type:String,
        required:true
    },
    paymentSessionId:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    BuildingName:{
        type:String,
        required:true
    },
    orderData:[
        {
            bookId:{
                type:mongoose.Schema.Types.ObjectId,    
                ref:"Booksdata",
                required:true
            },
            quantity:{
                type:Number,
                default:1
            }   

        }
    ]
})

export const PaymentOrderdata = mongoose.model("paymentorderdata" , paymentSceham)