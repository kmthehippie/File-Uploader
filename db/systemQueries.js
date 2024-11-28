const prisma = require("../script.ts");

exports.fetchFolders = async function (userId) {
  const response = await prisma.folder.findMany({
    where: {
      uploaderId: userId,
    },
    orderBy: {
      title: "asc",
    },
  });
  return response;
};

exports.fetchFilesByFolderId = async function (folderId) {
  const response = await prisma.file.findMany({
    where: {
      folderId: folderId,
    },
  });
  return response;
};

exports.fetchFileByFileId = async function (fileId) {
  const response = await prisma.file.findUnique({
    where: { id: fileId },
  });
  return response;
};

exports.createFolder = async function (data) {
  console.log(`Trying to create a folder in query `, data);

  const folder = await prisma.folder.create({
    data: {
      title: data.title,
      uploaderId: data.uploaderId,
    },
  });

  return folder;
};

exports.createFile = async function (data) {
  console.log("In system queries: ", data);
  const file = await prisma.file.create({
    data: {
      name: data.name,
      description: data.description,
      link: data.link,
      size: data.size,
      folder: { connect: { id: data.folder } },
      uploader: { connect: { id: data.uploader } },
      downloadLink: data.downloadLink,
      fileType: data.fileType,
      downloadName: data.downloadName,
    },
  });
  return file;
  // data = name, description if there is, link, userid, folderid
};

exports.deleteFolderAndFiles = async function (folderId) {
  console.log("Folder id in query ", folderId);

  const delFiles = await prisma.file.deleteMany({
    where: { folderId: folderId },
  });
  console.log(delFiles);
  if (delFiles) {
    const delFolder = await prisma.folder.delete({
      where: { id: folderId },
    });
    return { filesDeleted: delFiles, folderDeleted: delFolder };
  }
};
exports.deleteFolder = async function (folderId) {
  const delFolder = await prisma.folder.delete({
    where: { id: folderId },
  });
  return delFolder;
};

exports.deleteFile = async function (fileId) {
  console.log(fileId);
  const deleteFile = await prisma.file.delete({
    where: { id: fileId },
  });
  return deleteFile;
};

exports.updateFolder = async function (folderId, fileId) {
  console.log(folderId, fileId);
  const updateFolder = await prisma.folder.update({
    where: { id: folderId },
    data: { file: { connect: { id: fileId } } },
  });
  return updateFolder;
};

exports.createShare = async function (folderId, expiresAt, creator) {
  console.log("Create Share in Query: ", folderId, expiresAt);
  const createShare = await prisma.share.create({
    data: {
      folder: { connect: { id: folderId } },
      expiresAt: expiresAt,
      creator: { connect: { id: creator } },
    },
  });
  console.log(createShare);
  return createShare;
};

exports.fetchShared = async function (shareId) {
  const getShared = await prisma.share.findUnique({
    where: { id: shareId },
  });
  return getShared;
};

exports.fetchFolderByFolderId = async function (folderId) {
  const fetchFolder = await prisma.folder.findUnique({
    where: { id: folderId },
  });
  return fetchFolder;
};

exports.fetchSharedByUser = async function (userId) {
  const fetchAllShared = await prisma.share.findMany({
    where: { creatorId: userId },
  });
  return fetchAllShared;
};
exports.updateFile = async function (fileId) {};

exports.ADMINdeleteShared = async function () {
  const deleteShare = await prisma.share.deleteMany();
  console.log(deleteShare);
  return deleteShare;
};
