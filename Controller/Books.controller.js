import { BooksUser } from "../models/Books.js";
import { asyncHandler } from "../utils/asynHandler.js";
import uploadCloudinary from "../utils/cloudinary.js";
import { sellBookData } from "../models/SellBookImage.js";

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

const selloldBookData = asyncHandler(async(req , res) => {
    const {title , author , price , description , condition , category} = req.body
    console.log(title , author , price , description , category , condition)
    if ([title, author, price, description, condition, category].some(f => f.trim() === "")) {
        return res.status(401).json({
            success:false,
            message:"All feilds are required"
        })
}
const uploadBookImage = req.file.path
console.log(uploadBookImage)
if(!uploadBookImage){
    return res.status(401).json({
        success:false,
        message:"image not uploaded"
    })
}
const uploadinCloudinary = await uploadCloudinary(uploadBookImage)
if(!uploadinCloudinary){
    return res.status(401).json({
        success:false,
        message:"url not found"
    })
}
console.log(uploadinCloudinary)

const bookdatasave = await sellBookData.create({
    userId:req.user._id,
    title,
    description,
    author,
    price,
    bookImage:uploadinCloudinary.url,
    condition,
    category
    
})

return res.status(200).json({
    success:true,
    message:"data save"
})

})

const getsellBook = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log(userId, "---------");

    // find all books where userId matches
    const findsellBook = await sellBookData.find({ userId: userId }); // ✅ correct
    console.log(findsellBook);

    return res.status(200).json({
        success: true,
        books: findsellBook
    });
});


export {
    Bookdatafind,
    FindMedicalBook,
    FindEngineeringBook,
    selloldBookData,
    getsellBook
}