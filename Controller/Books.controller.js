import { BooksUser } from "../models/Books.js";
import { asyncHandler } from "../utils/asynHandler.js";
import uploadCloudinary from "../utils/cloudinary.js";
import { sellBookData } from "../models/SellBookImage.js";
import Groq from "groq-sdk";
import dotenv from "dotenv"

dotenv.config()

const groq = new Groq({
  apiKey: process.env.APIKEY
});


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

const selloldBookData = asyncHandler(async (req, res) => {
  const { title, author, description, category } = req.body;

  if (!title || !author || !description || !category) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image not uploaded"
    });
  }

  const uploadResult = await uploadCloudinary(req.file.path);

  if (!uploadResult?.secure_url) {
    return res.status(400).json({
      success: false,
      message: "Image upload failed"
    });
  }

  const validConditions = ["NEW", "GOOD", "AVERAGE", "BAD"];

  const aiResponse = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0,
    max_tokens: 10,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
If image is not a book return NOT_BOOK.
Otherwise return only one word:
NEW, GOOD, AVERAGE, BAD.
`
          },
          {
            type: "image_url",
            image_url: {
              url: uploadResult.secure_url
            }
          }
        ]
      }
    ]
  });

  const aiCondition = aiResponse.choices[0].message.content.trim().toUpperCase();

  if (aiCondition === "NOT_BOOK") {
    return res.status(400).json({
      success: false,
      message: "Please upload a valid book image"
    });
  }

  if (!validConditions.includes(aiCondition)) {
    return res.status(400).json({
      success: false,
      message: "AI classification failed"
    });
  }

  // 🔥 Base pricing logic
  const baseCategoryPrice = {
    MEDICAL: 400,
    ENGINEERING: 300,
    NOVEL: 200,
    SCHOOL: 140
  };

  const multipliers = {
    NEW: 1,
    GOOD: 0.8,
    AVERAGE: 0.6,
    BAD: 0.4
  };

  const basePrice = baseCategoryPrice[category.toUpperCase()] || 500;
  const finalPrice = Math.round(basePrice * multipliers[aiCondition]);

  const bookdatasave = await sellBookData.create({
    userId: req.user._id,
    title: title.trim(),
    author: author.trim(),
    description: description.trim(),
    condition: aiCondition,
    category: category.trim(),
    originalPrice: finalPrice,
    bookImage: uploadResult.secure_url
  });

  return res.status(201).json({
    success: true,
    message: "Book listed successfully",
    data: bookdatasave
  });
});


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

const showSellBook = asyncHandler(async(req , res) => {
    const booksData = await sellBookData.find()
    if(!booksData){
        return res.status(401).json({
            success:false,
            message:"Books not found"
        })
    }
    return res.status(200).json({
        success:true,
        booksData,
    })
})

export {
    Bookdatafind,
    FindMedicalBook,
    FindEngineeringBook,
    selloldBookData,
    getsellBook,
    showSellBook
}