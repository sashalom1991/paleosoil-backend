const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { BadRequest, Conflict, Unauthorized } = require("http-errors");

const { User } = require("../../models");
const { joiSignupSchema, joiLoginSchema } = require("../../models/user");
const { authenticate } = require("../../middlewares");

const { SECRET_KEY } = process.env;

const router = express.Router();

// регистрация пользователя с хешированием пароля
router.post("/register", async (req, res, next) => {
  try {
    const { error } = joiSignupSchema.validate(req.body);
    if (error) {
      throw new BadRequest("Ошибка от Joi или другой библиотеки  валидации");
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Conflict("Email in use");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      email,
      password: hashPassword,
    });

    const { _id } = newUser;
    const payload = {
      id: _id,
    };

    const token = jwt.sign(payload, SECRET_KEY);
    await User.findByIdAndUpdate(_id, { token });
    res.status(201).json({
      message: "User registered",
      data: {
        token,
        user: {
          email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// логирование пользователя на сайте
router.post("/login", async (req, res, next) => {
  try {
    const { error } = joiLoginSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      throw Unauthorized("Email or password is wrong");
    }
    const passwordUser = await bcrypt.compare(password, user.password);
    if (!passwordUser) {
      throw Unauthorized("Email or password is wrong");
    }

    const { _id } = user;
    const payload = {
      id: _id,
    };

    const token = jwt.sign(payload, SECRET_KEY);
    await User.findByIdAndUpdate(_id, { token });
    res.json({
      token,
      user: {
        email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// текущий пользователь
router.get("/current", authenticate, async (req, res, next) => {
  const { email, token } = req.user;
  res.json({
    token,
    user: {
      email,
    },
  });
});

// разлогинивание пользователя
router.get("/logout", authenticate, async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).send();
});

module.exports = router;
