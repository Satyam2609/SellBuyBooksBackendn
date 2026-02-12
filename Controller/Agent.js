import Groq from "groq-sdk";
import fs from "fs";
import { asyncHandler } from "../utils/asynHandler.js";
import uploadCloudinary from "../utils/cloudinary.js";

const groq = new Groq({
  apiKey: process.env.APIKEY
});

const ORIGINAL_PRICE = 500;

const priceMap = {
  NEW: 0.8,
  GOOD: 0.6,
  AVERAGE: 0.4,
  BAD: 0.2
};

export const imagePrice = asyncHandler(async (req, res) => {

  // 1️⃣ Validate File
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Book image is required"
    });
  }

  // 2️⃣ Upload to Cloudinary
  const uploaded = await uploadCloudinary(req.file.path);

  // remove local temp file
  fs.unlinkSync(req.file.path);

  if (!uploaded || !uploaded.secure_url) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed"
    });
  }

  const aiResponse = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0,
    max_tokens: 50,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
You are a strict book condition classifier.
First current image is book or not if not book then return "I need a book image". If it is a book then classify the condition of the book into one of the following categories: NEW, GOOD, AVERAGE, BAD.
Use the following criteria for classification:
- NEW: No visible wear, looks like new.
- GOOD: Minor signs of use, no major damage.
- AVERAGE: Noticeable wear, some damage but still usable.
- BAD: Heavy wear, significant damage, may not be usable.

Classify the book condition from the image.

Possible outputs:
NEW
GOOD
AVERAGE
BAD

Return ONLY one word from the list.
No explanation.
`
          },
          {
            type: "image_url",
            image_url: {
              url: uploaded.secure_url
            }
          }
        ]
      }
    ]
  });

  const raw = aiResponse.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    return res.status(500).json({
      success: false,
      message: "AI returned empty response"
    });
  }

  const condition = raw.toUpperCase();

  // 4️⃣ Validate AI Output
  if (!priceMap[condition]) {
    return res.status(500).json({
      success: false,
      message: "Invalid condition detected by AI",
      raw: raw
    });
  }

  // 5️⃣ Backend Price Calculation (SAFE)
  const finalPrice = Math.round(ORIGINAL_PRICE * priceMap[condition]);

  // 6️⃣ Final Response
  return res.status(200).json({
    success: true,
    data: {
      originalPrice: ORIGINAL_PRICE,
      condition,
      finalPrice,
      imageUrl: uploaded.secure_url
    }
  });

});
