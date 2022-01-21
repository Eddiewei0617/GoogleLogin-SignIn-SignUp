const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

// login
router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// signup
router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

// logout
router.get("/logout", (req, res) => {
  req.logOut(); // passport內建的
  res.redirect("/");
});

// 本地版 - 接送login表單資料
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login", // 如果錯誤的話導到哪裡
    failureFlash: "Wrong email or password", // 給甚麼錯誤訊息
  }),
  (req, res) => {
    if (req.session.returnTo) {
      // 這個req.session.returnTo 是在index頁設定的中間鍵，可以抓取使用者原本想去哪一個分頁，但是還沒登入，所以登入後會幫她回到她想去的那個頁面
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

// 本地版 - 接送signup表單資料
router.post("/signup", async (req, res) => {
  let { name, email, password } = req.body;
  // check if the data is already in db
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    req.flash("error_msg", "Email has already been registered.");
    res.redirect("/auth/signup");
  } else {
    const hashPassword = await bcrypt.hash(password, 10);
    let newUser = new User({ name, email, password: hashPassword });
    try {
      await newUser.save();
      req.flash("success_msg", "Registration succeeds. You can login now.");
      res.redirect("/auth/login");
    } catch (err) {
      req.flash("error_msg", err.errors.name.message);
      res.redirect("/auth/signup");
    }
  }
});

// google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// 登入之後導回之前該使用者想去的頁面
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
