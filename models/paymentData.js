import mongoose from "mongoose";

const paymentSceham = new mongoose.Schema({
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
    }
})

export const PaymentOrderdata = mongoose.model("paymentorderdata" , paymentSceham)