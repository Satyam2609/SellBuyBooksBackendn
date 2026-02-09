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

const FindMedicalBook = asyncHandler(async(req , res) => {
    const findata = await BooksUser.find({category:"medical"})
    console.log(findata)
    if(!findata){
        return res.status(401).json({
            success:false,
            message:"Medical Books not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"DataFounded",
        findata
    })
    
})

const FindEngineeringBook = asyncHandler(async(req , res) => {
    const findata = await BooksUser.find({category:"engineering"})
    console.log(findata)
    if(!findata){
        return res.status(401).json({
            success:false,
            message:"Medical Books not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"DataFounded",
        findata
    })
    
})

export {
    Bookdatafind,
    FindMedicalBook,
    FindEngineeringBook
}