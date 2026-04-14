import { BooksUser } from "../models/Books.js";
import { asyncHandler } from "../utils/asynHandler.js";
import uploadCloudinary from "../utils/cloudinary.js";
import { sellBookData } from "../models/SellBookImage.js";
import Groq from "groq-sdk";
import dotenv from "dotenv"
import client from "../Client.js";
import { json } from "express";

dotenv.config()

const groq = new Groq({
  apiKey: process.env.APIKEY
});


const Bookdatafind = asyncHandler(async (req, res) => {
  let finddata 

  finddata = await client.get("booksData")
  if (finddata) {
    console.log("Cache hit for booksData");
    return res.status(200).json({
      success: true,
      message: "Book finded",
      finddata:JSON.parse(finddata)
    })
  } 
    
  else{
     const finddata = await BooksUser.find()
  await client.set("booksData", JSON.stringify(finddata), "EX", 60 * 60)

  if (!finddata) {
    return res.status(401).json({
      success: false,
      message: "not found"
    })
  }

  return res.status(200).json({
    success: true,
    message: "Book finded",
    finddata
  })
  
  }
 
})

const FindMedicalBook = asyncHandler(async (req, res) => {
  let findata
  findata = await client.get("medicalBookData")
  if(findata){
    return res.status(200).json({ 
      success: true,
      message: "Medical Books Found",
      findata: JSON.parse(findata)
    })  
  }
   
  findata = await BooksUser.find({ category: { $regex: /^medical$/i } })
  await client.set("medicalBookData", JSON.stringify(findata), "EX", 60 * 60)
  console.log("Medical Books found:", findata.length)
  return res.status(200).json({
    success: true,
    message: "DataFounded",
    findata
  })

})

const FindEngineeringBook = asyncHandler(async (req, res) => {
  const findata = await BooksUser.find({ category: { $regex: /^engineering$/i } })
  console.log("Engineering Books found:", findata.length)

  return res.status(200).json({
    success: true,
    message: findata.length > 0 ? "Engineering Books Found" : "No Engineering Books Found",
    findata
  })
})

const FindComedyBook = asyncHandler(async (req, res) => {
  const findata = await BooksUser.find({ category: { $regex: /^comedy$/i } })
  console.log("Engineering Books found:", findata.length)

  return res.status(200).json({
    success: true,
    message: findata.length > 0 ? "Engineering Books Found" : "No Engineering Books Found",
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

const showSellBook = asyncHandler(async (req, res) => {
  const booksData = await sellBookData.find()
  if (!booksData) {
    return res.status(401).json({
      success: false,
      message: "Books not found"
    })
  }
  return res.status(200).json({
    success: true,
    booksData,
  })
})

const searchBooks = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required"
    });
  }

  const searchRegex = new RegExp(q, 'i');

  // Search in both models
  const [booksCatalog, userListedBooks] = await Promise.all([
    BooksUser.find({
      $or: [
        { title: searchRegex },
        { brandName: searchRegex },
        { category: searchRegex }
      ]
    }),
    sellBookData.find({
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex }
      ]
    })
  ]);

  // Normalize user listed books to match Catalog format if needed, or just combine
  const combinedResults = [
    ...booksCatalog.map(b => ({ ...b._doc, source: 'catalog' })),
    ...userListedBooks.map(b => ({ ...b._doc, source: 'user-listed', image: b.bookImage, discountPrice: b.originalPrice }))
  ];

  return res.status(200).json({
    success: true,
    results: combinedResults
  });
});

export {
  Bookdatafind,
  FindMedicalBook,
  FindEngineeringBook,
  selloldBookData,
  getsellBook,
  showSellBook,
  searchBooks,
  FindComedyBook
}