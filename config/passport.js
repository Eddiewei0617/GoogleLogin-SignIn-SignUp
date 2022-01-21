const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20"); // google登入使用
const User = require("../models/user-model");
const LocalStrategy = require("passport-local"); // 本地登入使用
const bcrypt = require("bcrypt");

// 這個serialize是說我們要把使用者的ID存入cookie session裡，而serialize是將object轉成string (因為session存的格式是string，)
passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  done(null, user._id); // 記得要 _id (因為使用者可能用本地登入也可能用google登入，會有不同id )
});

// deserialize會將string轉成object，也就是我們從cookie session再拿出來使用
passport.deserializeUser((_id, done) => {
  console.log("Deserializeing user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user.");
    done(null, user);
  });
});

// 本地端登入驗證
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        } else {
          let comparePassword = await bcrypt.compare(
            password,
            user.password,
            function (err, result) {
              if (err) {
                return done(null, false);
              }
              if (!result) {
                return done(null, false);
              } else {
                return done(null, user);
              }
            }
          );
        }
      })
      .catch((err) => {
        return done(null, false);
      });
  })
);

// google登入
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },
    // 這個callback function固定有這四個值，按下登入後先找找看這個ID的使用者有沒有在資料庫(理論上是不會有)，如果有，就去取他資料；如果沒有，就馬上新建一個並存進資料表
    (accessToken, refreshToken, profile, done) => {
      // console.log("profile", profile);
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          console.log("I found the user for: ", foundUser);
          done(null, foundUser);
        } else {
          new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              console.log("New user created");
              done(null, newUser);
            });
        }
      });
    }
  )
);
