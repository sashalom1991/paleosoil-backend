const express = require("express");
const router = express.Router();
const { NotFound, BadRequest } = require("http-errors");

const { authenticate } = require("../../middlewares");
const { PaleosoilUkrPoints } = require("../../models");
const {
  JoiShemaPaleosoilUa,
  JoiShemaPaleosoilUaUpdate,
} = require("../../models");

router.get("/", async (req, res, next) => {
  try {
    const pointUa = await PaleosoilUkrPoints.find();
    return res.json(pointUa);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const pointUa = await PaleosoilUkrPoints.findById(id);
    if (!pointUa) {
      throw new NotFound();
      // const error = new Error("Not found");
      // error.status = '404';
      // throw error;
    }
    res.json(pointUa);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/add", authenticate, async (req, res, next) => {
  try {
    const { error } = JoiShemaPaleosoilUa.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const newPointUa = await PaleosoilUkrPoints.create({
      ...req.body,
      owner: _id,
    });
    res.status(201).json(newPointUa);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletePointUa = await PaleosoilUkrPoints.findByIdAndRemove(id);
    if (!deletePointUa) {
      throw new NotFound();
    }
    res.json({ message: "Point of paleosoil-ua deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/change/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatePointUa = await PaleosoilUkrPoints.findByIdAndUpdate(
      id,
      req.body
    );
    if (!updatePointUa) {
      throw new NotFound();
    }
    res.json(updatePointUa);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
