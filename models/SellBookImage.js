import mongoose from "mongoose";

const sellBook = new mongoose.Schema({
    userId:{
        type:String,
        required:true

    },
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
   description:{
        type:String,
        required:true
    },
    bookImage:{
        type:String,
        required:true
    },
    condition:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    }

})

export const sellBookData = mongoose.model("selldata" , sellBook)

