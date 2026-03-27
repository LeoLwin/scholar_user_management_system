import express, { Request, Response } from "express";
import { getFeatures, getFeatureById, createFeature, updateFeature, deleteFeature } from "../services/featureService";
import ResponseStatus from "../helper/responseStatus";
import { ListValidator } from "../validator/commonValidator";
import { CreateFeaturesValidator } from "../validator/featuresValidator";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", async (req: Request, res: Response) => {
  try {
    const result = await getFeatures();
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Feature ID is required"));
    }
    const result = await getFeatureById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", CreateFeaturesValidator, async (req: Request, res: Response) => {
  try {
    const result = await createFeature(req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Feature ID is required"));
    }
    const result = await updateFeature(id, req.body);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.json(ResponseStatus.INVALID_ARGUMENT("Feature ID is required"));
    }
    const result = await deleteFeature(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;