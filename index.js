require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoute = require("./routes/auth-routes");
const profileRoute = require("./routes/profile-routes");
require("./config/passport");
// const cookieSession = require("cookie-session");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connect to mongoDB atlas");
  })
  .catch((err) => {
    console.log(err);
  });

// middleware (順序很重要，前面先基本設定，再跑session，跑完最後才是router)
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// 讓browser儲存這些session-------
app.use(passport.initialize());
app.use(passport.session());
// ----------------------------------
// 設定flash中間鍵 ----------------------- start
app.use(flash());
app.use((req, res, next) => {
  // res.locals內建success和error可以讓大家設定訊息內容，並且views資料夾裡的各位也知道這是甚麼
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error"); // 這是passport本地端登入專屬的錯誤訊息
  next();
});
// 設定flash中間鍵 -----------------------end
app.use("/auth", authRoute); // 可以進到authRoute頁面把router的網址前加上/auth
app.use("/profile", profileRoute);

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
