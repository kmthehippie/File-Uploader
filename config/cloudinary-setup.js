const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const fs = require("fs");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.cloudinaryUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded to multer");
  }

  const fileBuffer = req.file.buffer;

  const uploadStream = cloudinary.uploader.upload_stream(
    { resource_type: "image" },
    (error, result) => {
      if (error) {
        console.error(
          "Error when cloudinary upload from memoryStorage ",
          error
        );
        return res
          .status(500)
          .send("Failed to upload to cloudinary via memoryStorage");
      }
      req.cloudinaryResult = result;

      next();
    }
  );

  uploadStream.end(fileBuffer);
};

exports.cloudinaryUploadDisk = (req, res, next) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded to Multer");
  }
  const filePath = path.join(__dirname, "uploads", req.file?.filename);
  console.log("Cloudinary file path ", filePath);
  cloudinary.uploader.upload(
    filePath,
    { resource_type: "auto" },
    (error, result) => {
      if (error) {
        console.error("Error when cloudinary upload from diskStorage", error);
        return res
          .status(500)
          .send("Failed to upload to cloudinary via diskStorage");
      }

      req.cloudinaryResult = result;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file at ${filePath}`, err);
        } else {
          console.log(`File at ${filePath} deleted succesfully`);
        }
      });

      next();
    }
  );
};
