import express from "express";
import {
  logLoginActivity,
  getLoginActivities,
  getLoginHeatmapData,
  getLoginStatistics,
} from "../controllers/LoginActivityController.js";

const router = express.Router();

// POST - Log a login activity
router.post("/", logLoginActivity);

// GET - Get login activities with filters
router.get("/", getLoginActivities);

// GET - Get heatmap data
router.get("/heatmap", getLoginHeatmapData);

// GET - Get statistics
router.get("/statistics", getLoginStatistics);

export default router;
