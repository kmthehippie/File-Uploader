const express = require("express");
const router = express.Router();

const { isAuthenticated } = require("../middleware/authMiddleware");
const { uploadFile } = require("../config/multer-setup");
const { cloudinaryUploadDisk } = require("../config/cloudinary-setup");
const sysController = require("../controllers/sysController");
const { sys } = require("typescript");

router.get("/", isAuthenticated, sysController.getFoldersByUserId);

router.post("/folder/create", isAuthenticated, sysController.createNewFolder);

router.get("/files", sysController.getFilesByFolderId);

router.post(
  "/file/create",
  isAuthenticated,
  uploadFile.single("uploadFile"),
  cloudinaryUploadDisk,
  sysController.createNewFile
);

router.get("/file/:fileId", sysController.getFileByFileId);

router.post("/file/:fileId", isAuthenticated, sysController.deleteFileByFileId);

router.delete(
  "/folder/file/delete/:folderId",
  isAuthenticated,
  sysController.deleteFolderAndFilesByFolderId
);

router.delete(
  "/folder/delete/:folderId",
  isAuthenticated,
  sysController.deleteFolderByFolderId
);

router.post("/share/create", isAuthenticated, sysController.createShare);

router.get("/shared/:shareId", sysController.getSharedFolder);

router.get("/myshared", sysController.getMyShared);
module.exports = router;
