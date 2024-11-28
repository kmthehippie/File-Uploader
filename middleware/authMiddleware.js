exports.isAuthenticated = async (req, res, next) => {
  req.user ? next() : res.redirect("/auth/login");
};
