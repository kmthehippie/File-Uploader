const asyncHandler = require("express-async-handler");
const {
  fetchFolders,
  createFolder,
  fetchFilesByFolderId,
  createFile,
  updateFolder,
  fetchFileByFileId,
  deleteFile,
  deleteFolder,
  deleteFolderAndFiles,
  createShare,
  fetchShared,
  fetchFolderByFolderId,
  fetchSharedByUser,
  ADMINdeleteShared,
} = require("../db/systemQueries");

exports.getFoldersByUserId = asyncHandler(async (req, res, next) => {
  const response = await fetchFolders(req.user.id);
  res.render("system", { user: req.user || null, folders: response });
});

exports.createNewFile = asyncHandler(async (req, res, next) => {
  try {
    const { name, description, folder } = req.body;
    function changeFileName(name) {
      return name.replace(/[^a-zA-Z0-9]/g, "");
    }
    function insertString(originalUrl, insert) {
      const insertPoint = "upload/";
      const index = originalUrl.indexOf(insertPoint) + insertPoint.length;
      return originalUrl.slice(0, index) + insert + originalUrl.slice(index);
    }
    const fileName = changeFileName(name);
    const toInsert = "fl_attachment:" + fileName + "/";

    const downloadLink = insertString(
      req.cloudinaryResult.secure_url,
      toInsert
    );
    const fileType = req.cloudinaryResult.format;
    const imageUrl = req.cloudinaryResult.secure_url;
    const userId = req.user.id;
    const size = req.cloudinaryResult.bytes;
    const finalDesc = description || null;
    const data = {
      name: name,
      downloadName: fileName,
      description: finalDesc,
      folder: folder,
      uploader: userId,
      link: imageUrl,
      size: size,
      downloadLink: downloadLink,
      fileType: fileType,
    };
    const fileResponse = await createFile(data);
    if (!fileResponse || !fileResponse.id) {
      throw new Error("File Creation failed.");
    }
    const fileId = fileResponse.id;

    const folderResponse = await updateFolder(folder, fileId);

    if (!folderResponse) {
      throw new Error("Failed to update the folder");
    }

    res
      .status(200)
      .send({ success: true, message: "File uploaded and folder updated" });
    //query to prisma to update folder to contain this file
    //query to prisma to create a new file
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: `Error trying to upload file and updating folder ${err}`,
    });
  }
});

exports.getFilesByFolderId = asyncHandler(async (req, res, next) => {
  const folderId = req.query.folderId;
  try {
    const files = await fetchFilesByFolderId(folderId);
    res.status(200).send({ files: files });
  } catch (err) {
    res.status(500).send({ message: "Error getting files by folder id" });
  }
});

exports.createNewFolder = asyncHandler(async (req, res, next) => {
  const { title } = req.body;
  const data = {
    title: title,
    uploaderId: req.user.id,
  };
  const response = await createFolder(data);
  if (response) {
    res.status(200).send({ success: true });
  }
});

exports.getFileByFileId = asyncHandler(async (req, res, next) => {
  const fileId = req.params.fileId;
  const response = await fetchFileByFileId(fileId);
  const formattedDate = new Date(response.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
  response.formattedDate = formattedDate;
  res.render("file", { file: response });
});

exports.deleteFileByFileId = asyncHandler(async (req, res, next) => {
  try {
    const fileId = req.params.fileId;
    console.log("File id in controller: ", fileId);
    const response = await deleteFile(fileId);
    console.log("Response from deleting file: ", response);
    if (response) {
      res.status(204).send({ message: "Deleted file succesfully" });
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

exports.deleteFolderAndFilesByFolderId = asyncHandler(
  async (req, res, next) => {
    try {
      const folderId = req.params.folderId;
      const response = await deleteFolderAndFiles(folderId);
      console.log("Deleted folder and files in query: ", response);

      if (response) {
        res
          .status(204)
          .send({ message: "Deleted folder and files succesfully" });
      } else {
        res.status(500).send("Internal Server Error");
      }
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  }
);

exports.deleteFolderByFolderId = asyncHandler(async (req, res, next) => {
  try {
    const folderId = req.params.folderId;
    const response = await deleteFolder(folderId);

    if (response) {
      res.status(204).send({ message: "Deleted folder and files succesfully" });
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

exports.createShare = asyncHandler(async (req, res, next) => {
  // const response = await ADMINdeleteShared();
  // console.log(response);
  try {
    const folderId = req.body.folderId;
    const expiresAt = req.body.expiresAt;
    const creator = req.user.id;
    const response = await createShare(folderId, expiresAt, creator);
    console.log("This is response at controller: ", response);
    if (response) {
      res.status(200).send({ shared: response });
    } else {
      throw new Error("Internal Server Error");
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error: error });
  }
});

exports.getSharedFolder = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.params.shareId);
    const shareId = req.params.shareId;
    // TODO: GET THE SHARE ID TO GET THE FOLDER ID
    const sharedFolder = await fetchShared(shareId);
    console.log("share: ", sharedFolder);
    const fetchFolder = await fetchFolderByFolderId(sharedFolder.folderId);
    console.log("folder: ", fetchFolder);
    const fetchFiles = await fetchFilesByFolderId(sharedFolder.folderId);
    console.log("files: ", fetchFiles);
    // TODO: FOLDER ID - GET ALL THE FILE ID
    // TODO: res.render('shared', { user: req.user, share: share, folder: folder, files: files})

    res.render("shared", {
      user: req.user,
      share: sharedFolder,
      folder: fetchFolder,
      files: fetchFiles,
    });
  } catch (error) {
    console.error(error);
  }
});

exports.getMyShared = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const sharedLinks = await fetchSharedByUser(userId);
  for (const link of sharedLinks) {
    if (link.folderId) {
      const folder = await fetchFolderByFolderId(link.folderId);
      link.folderTitle = folder ? folder.title : "Untitled";
    }
  }
  res.render("myShared", { user: req.user, share: sharedLinks });
});
