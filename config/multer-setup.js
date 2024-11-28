const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureUploadsDirectory = () => {
  const dir = path.join(__dirname, "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

ensureUploadsDirectory();

const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "uploads");
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

exports.uploadPhoto = multer({
  storage: memoryStorage,
  limits: { fileSize: 2_000_000 }, //1-2 MB for profile picture is sufficient. If you need higher quality image then larger limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Not an image! Please upload only images!"));
  },
});

exports.uploadFile = multer({
  storage: diskStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, //Set to 100MB
  fileFilter: function (req, file, cb) {
    //Allowed file types
    const filetypes = /jpeg|jpg|png|gif|pdf|mp4/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type! Only images, pdf or MP4 videos."));
    }
  },
});
