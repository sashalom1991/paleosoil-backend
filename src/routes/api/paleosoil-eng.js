const express = require("express");
const router = express.Router();
const { NotFound, BadRequest } = require("http-errors");

const { authenticate } = require("../../middlewares");
const { PaleosoilEngPoints } = require("../../models");
const {
  JoiShemaPaleosoilEng,
  JoiShemaPaleosoilEngUpdate,
} = require("../../models");

router.get("/", async (req, res, next) => {
  try {
    const pointEng = await PaleosoilEngPoints.find();
    return res.json(pointEng);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", authenticate, async (req, res, next) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const pointEng = await PaleosoilEngPoints.findById(id);
    if (!pointEng) {
      throw new NotFound();
    }
    res.json(pointEng);
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed")) {
      error.status = 404;
    }
    next(error);
  }
});

router.post("/add", authenticate, async (req, res, next) => {
  try {
    const { error } = JoiShemaPaleosoilEng.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const newPointEng = await PaleosoilEngPoints.create({
      ...req.body,
      owner: _id,
    });
    res.status(201).json(newPointEng);
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
    const deletePointEng = await PaleosoilEngPoints.findByIdAndRemove(id);
    if (!deletePointEng) {
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
    const updatePointEng = await PaleosoilEngPoints.findByIdAndUpdate(
      id,
      req.body
    );
    if (!updatePointEng) {
      throw new NotFound();
    }
    res.json(updatePointEng);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
});

module.exports = router;
