import Groq from "groq-sdk";
import axios from "axios";
import { asyncHandler } from "../utils/asynHandler.js";
import { BooksUser } from "../models/Books.js";

const groq = new Groq({
  apiKey: process.env.APIKEY
});

export const bookPredictor = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Subject text is required"
    });
  }

  // 1️⃣ AI Recommendation (No Images)
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `
You are an expert academic book advisor you can give books data with proper descriptions why the book is recommended and why it is important for your purpose and you can ensure book image was also come from google and you can add market price and give perfect low price recommendations aslo you can told where the book is available.

Return ONLY valid JSON in this format:

{
  "beginner": {
    "title": "",
    "image": "",
    "description": ""
    "price": "",
    "availableAt": ""
  },
  "advanced": {
    "title": "",
    "image": "",
    "description": ""
      "price": "",
    "availableAt": ""
  },
  "practical": {
    "title": "",
    "image": "",
    "description": ""
      "price": "",
    "availableAt": "" 
  }
}

Rules:
- Do NOT provide image URL
- Keep image field as empty string ""
- No extra text outside JSON
`
      },
      {
        role: "user",
        content: text
      }
    ],
    temperature: 0.4
  });

  let parsedData;

  try {
    parsedData = JSON.parse(response.choices[0].message.content);

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "AI returned invalid JSON"
    });
  }

  // 2️⃣ Fetch Real Images from Google Books API
  const categories = ["beginner", "advanced", "practical"];

  for (let category of categories) {
    const title = parsedData[category].title;

    try {
      const googleRes = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`
      );

      const volumeInfo = googleRes.data.items?.[0]?.volumeInfo;
      const image = volumeInfo?.imageLinks?.thumbnail || "";
      const buyLink = volumeInfo?.infoLink || "";

      parsedData[category].image = image;
      parsedData[category].buyLink = buyLink;
    } catch (err) {
      parsedData[category].image = "";
      parsedData[category].buyLink = "";
    }
  }

  // 3️⃣ Search and Link Local Database Books
  const searchTitles = categories.map(cat => parsedData[cat].title).filter(Boolean);

  let databaseBooks = [];
  if (searchTitles.length > 0) {
    // Helper to escape regex special characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    databaseBooks = await BooksUser.find({
      $or: searchTitles.map(title => ({
        title: { $regex: new RegExp(escapeRegex(title), "i") }
      }))
    });

    // Link database books back to recommendations to enrich the data
    for (let category of categories) {
      const aiTitle = parsedData[category].title;
      if (!aiTitle) continue;

      const matchedBook = databaseBooks.find(dbBook =>
        new RegExp(escapeRegex(aiTitle), "i").test(dbBook.title) ||
        new RegExp(escapeRegex(dbBook.title), "i").test(aiTitle)
      );

      if (matchedBook) {
        parsedData[category].price = matchedBook.discountPrice || matchedBook.originalPrice;
        parsedData[category].availableAt = "Our Local Store";
        parsedData[category].isLocal = true;
        parsedData[category].dbId = matchedBook._id;
      }
    }
  }

  console.log("AI Recommendation:", parsedData);
  console.log("Database Books Found:", databaseBooks);
  return res.status(200).json({
    success: true,
    recommendation: parsedData,
    databaseBooks: databaseBooks
  });
});
