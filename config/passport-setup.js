const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const GithubStrategy = require("passport-github2");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const validatePw = require("../config/password-utils").validatePw;

const {
  createGithubUser,
  createGoogleUser,
  createEmailUser,
  existingGoogleUser,
  existingGithubUser,
  existingUserEmail,
  existingUserId,
  findAllUsers,
} = require("../db/userQueries");

passport.serializeUser((user, done) => {
  if (!user || !user.id) {
    console.error("Invalid user object during serialization: ", user);
    return done(new Error("Invalid user object"));
  }
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (!id) {
      console.error("No user id provided for deserialization");
      return done(new Error("No user id provided in deserialization"));
    }
    const user = await existingUserId(id);
    if (!user) {
      console.error("No user found during deserialization");
      return done(new Error("User is not found during deserialization"));
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const existing = await existingUserEmail(email);
        if (!existing) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const validPw = await validatePw(existing.password, password);
        if (!validPw) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, existing);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.APPURL}/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existing = await existingGithubUser(profile.id);
        if (existing) {
          done(null, existing);
        } else {
          let data;
          if (profile._json.email === null) {
            const res = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `token ${accessToken}`,
              },
            });
            const emails = await res.json();
            const primaryEmail = emails.find((email) => email.primary).email;
            data = {
              email: primaryEmail,
              name: profile.displayName,
              profilePicture: profile.photos[0].value,
              githubId: profile.id,
              githubAccessToken: accessToken,
              githubRefreshToken: refreshToken,
            };
          } else {
            data = {
              email: profile._json.email,
              name: profile.displayName,
              profilePicture: profile.photos[0].value,
              githubId: profile.id,
              githubAccessToken: accessToken,
              githubRefreshToken: refreshToken,
            };
          }
          const create = await createGithubUser(data);
          done(null, create);
        }
      } catch (err) {
        console.error("Error in Google Strategy ", err);
        return done(err, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APPURL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existing = await existingGoogleUser(profile.id);
        if (existing) {
          done(null, existing);
        } else {
          const create = await createGoogleUser(
            profile,
            accessToken,
            refreshToken
          );
          done(null, create);
        }
      } catch (err) {
        console.error("Error in Google Strategy ", err);
        return done(err, null);
      }
    }
  )
);
