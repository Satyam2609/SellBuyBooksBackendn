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
You are an expert academic book advisor.

Return ONLY valid JSON in this format:

{
  "beginner": {
    "title": "",
    "image": "",
    "description": ""
  },
  "advanced": {
    "title": "",
    "image": "",
    "description": ""
  },
  "practical": {
    "title": "",
    "image": "",
    "description": ""
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

      const image =
        googleRes.data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail || "";

      parsedData[category].image = image;
    } catch (err) {
      parsedData[category].image = "";
    }
  }

  return res.status(200).json({
    success: true,
    recommendation: parsedData
  });
});
