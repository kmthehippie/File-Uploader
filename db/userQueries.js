const { idText } = require("typescript");
const prisma = require("../script.ts");

exports.createEmailUser = async function (data) {
  const user = await prisma.user.create({
    data: data,
  });
  return user;
};

exports.createGoogleUser = async function (
  userData,
  accessToken,
  refreshToken
) {
  const data = {
    email: userData.emails[0].value,
    name: userData.displayName,
    profilePicture: userData.photos[0].value,
    googleId: userData.id,
    googleAccessToken: accessToken,
    googleRefreshToken: refreshToken,
  };

  const user = await prisma.user.create({
    data: {
      email: data.email,
      googleId: data.googleId,
      name: data.name,
      profilePicture: data.profilePicture,
      googleAccessToken: data.googleAccessToken,
      googleRefreshToken: data.googleRefreshToken,
    },
  });
  return user;
};

exports.createGithubUser = async function (data) {
  const user = await prisma.user.create({
    data: data,
  });
  return user;
};

exports.existingUserEmail = async function (email) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return existingUser;
};

exports.existingUserId = async function (id) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return existingUser;
};

exports.existingGoogleUser = async function (googleId) {
  const existingUser = await prisma.user.findUnique({
    where: {
      googleId: googleId,
    },
  });
  return existingUser;
};

exports.existingGithubUser = async function (githubId) {
  const existingUser = await prisma.user.findUnique({
    where: {
      githubId: githubId,
    },
  });
  console.log("Query found existing github user ", existingUser);
  return existingUser;
};

exports.findAllUsers = async function () {
  const allUser = await prisma.user.findMany();
};

exports.deleteUser = async function (profile) {
  const delUser = await prisma.user.delete({
    where: { googleId: profile.id },
  });
  return delUser;
};

exports.deleteAllUser = async function () {
  const delAll = await prisma.user.deleteMany();
  return delAll;
};

exports.findAllSessions = async function () {
  const allSessions = await prisma.session.findMany();
  return allSessions;
};

exports.deleteAllSessions = async function () {
  const delAll = await prisma.session.deleteMany();
  return delAll;
};

exports.deleteUserId = async function (id) {
  const delUser = await prisma.user.delete({
    where: { id: id },
  });
  return delUser;
};

exports.updateUserPicture = async function (id, url) {
  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: { profilePicture: url },
  });
  return updatedUser;
};

exports.updateUserEmail = async function (id, email) {
  const updatedUser = await prisma.user.update({
    where: { id: id },
    data: { email: email },
  });
  return updatedUser;
};
