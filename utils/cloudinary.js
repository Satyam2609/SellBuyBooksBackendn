import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name:'dvogl4c7a',
    api_key:'248329574647344',
    api_secret:'2iCtnC6yiNpPDIu3QEKEqcHSvw8'
})

const uploadCloudinary = async(localFilePath) => {
    try{

   if(!localFilePath) return null
    const response = await cloudinary.uploader.upload(localFilePath , {
        resource_type:'auto'
    })
    console.log('file uploaded successfully' , response.url)
    return response
     }
     catch(err){
        fs.unlinkSync(localFilePath)
        return null
     }
}

export default uploadCloudinary