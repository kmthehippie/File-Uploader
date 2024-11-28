const express = require("express");
const session = require("express-session");
const passport = require("passport");
const prisma = require("./script.ts");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//Set up View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Setup Other stuff
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

//Setup Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      // dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
      tableName: "Session",
    }),
    cookie: {
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.SECURE_COOKIE === "true",
      maxAge: 24 * 60 * 60 * 1000, //ms 1day
    },
  })
);

//Setup Passport
app.use(passport.initialize());
app.use(passport.session());

//require passport config
require("./config/passport-setup");

//Require Routers
const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const systemRouter = require("./routes/sysRouter");

app.use((req, res, next) => {
  console.log(`Session id ${req.session.id}`);
  next();
});

const ensureUploadsDirectory = () => {
  const dir = path.join(__dirname, "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};

ensureUploadsDirectory();
//Set up Routers
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/system", systemRouter);

app.listen(port, () => {
  console.log(`App is now listening on port ${port}`);
});
