import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import router from "./routes/user.js"
import cors from "cors"


const app = express()
dotenv.config()
const allowedOrigins = [
  "http://localhost:3000",
  "https://sell-buy-books-nextjs.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / SSR
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));



app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/api" , router)

export default app