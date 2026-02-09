import { BooksUser } from "../models/Books.js";
import { asyncHandler } from "../utils/asynHandler.js";

const Bookdatafind = asyncHandler(async(req , res) => {
    const finddata = await BooksUser.find()
    if(!finddata){
        return res.status(401).json({
            success:false,
            message:"not found"
        })
    }

    return res.status(200).json({
        success:true,
        message:"Book finded",
        finddata
    })
})

export {
    Bookdatafind
}