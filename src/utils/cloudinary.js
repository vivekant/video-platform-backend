import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// making a function which takes a localFilePath and then it will uploda that file on cloudinary server
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary successfully!!!", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // it remove the temporarely save file in our server as uploading operation get failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    
    const response = await  cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    console.log("cloudinary se delete ho gaya hai !!!!!");
    console.log(response);
    
    
    return response;
  } catch (error) {
    // it remove the temporarely save file in our server as uploading operation get failed
    console.log("cloudinary se delete karne mein error aa gaya!!");
    
    console.log({ error });

    return null;
  }
};

export { uploadOnCloudinary ,deleteOnCloudinary};
