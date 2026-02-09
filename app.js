import dotenv from "dotenv"
import express from "express"
import cookieParser from "cookie-parser"
import router from "./routes/user.js"
import cors from "cors"


const app = express()
dotenv.config()
app.use(cors({
  origin:process.env.CORS,
  credentials: true
}));


app.use(express.json({limit:"10kb"}))
app.use(express.urlencoded({extended:true,limit:"10kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use("/api" , router)

export default app