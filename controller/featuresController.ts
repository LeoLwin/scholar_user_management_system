import express, { Request, Response } from "express";
import * as FeaturesModel from "../model/featuresModel";
import ResponseStatus from "../helper/responseStatus";

const router = express.Router();
const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

// GET /features/list
router.get("/list", async (req, res) => {
  try {
    const { current = 1, limit = 10 } = req.body;
    const result = await FeaturesModel.getFeatures();
    let list = result.data || [];
    const start = (current - 1) * limit;
    const paginatedList = list.slice(start, start + limit);
    res.json(ResponseStatus.OK({ total: list.length, list: paginatedList }));
  } catch (err) {
    handleError(res, err as Error);
  }
});

// POST /features
router.post("/", async (req, res) => {
  try {
    const result = await FeaturesModel.createFeature(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// PUT /features/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await FeaturesModel.updateFeature(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

// DELETE /features/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await FeaturesModel.deleteFeature(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;