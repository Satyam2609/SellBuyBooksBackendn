import mongoose from "mongoose";


const connectDB = async() => {
try {
    const connectInstance = await mongoose.connect(process.env.MONGODB_URL)
    console.log("mongoDB connected successfully")
    
} catch (error) {
    console.log("mongodb connection failed")
    process.exit(1)
    
}
}
export default connectDB