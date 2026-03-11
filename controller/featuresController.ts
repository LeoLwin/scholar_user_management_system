import express, { Request, Response } from "express";
import * as FeaturesModel from "../model/featuresModel";
import ResponseStatus from "../helper/responseStatus";
import { ListValidator } from "../validator/commonValidator";
import { CreateFeaturesValidator } from "../validator/featuresValidator";

const router = express.Router();
const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", ListValidator, async (req: Request, res: Response) => {
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

router.post("/", CreateFeaturesValidator, async (req: Request, res: Response) => {
  try {
    const result = await FeaturesModel.createFeature(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await FeaturesModel.updateFeature(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await FeaturesModel.deleteFeature(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;