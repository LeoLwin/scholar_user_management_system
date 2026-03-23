import express, { Request, Response } from "express";
import { FeatureService } from "../services/featureService";
import ResponseStatus from "../helper/responseStatus";
import { ListValidator } from "../validator/commonValidator";
import { CreateFeaturesValidator } from "../validator/featuresValidator";

const router = express.Router();
const featureService = new FeatureService();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};

router.get("/list", async (req: Request, res: Response) => {
  try {
    const result = await featureService.getFeatures();
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
    const result = await featureService.getFeatureById(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.post("/", CreateFeaturesValidator, async (req: Request, res: Response) => {
  try {
    const result = await featureService.createFeature(req.body);
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
    const result = await featureService.updateFeature(id, req.body);
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
    const result = await featureService.deleteFeature(id);
    res.json(result);
  } catch (err) {
    handleError(res, err as Error);
  }
});

export default router;