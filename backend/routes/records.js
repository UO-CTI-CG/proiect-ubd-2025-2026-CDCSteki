import expres from "express";
import { getAllRecords } from "../controllers/recordController.js";
import { createRecord } from "../controllers/recordController.js";


const router = expres.Router();

router.get("/", getAllRecords);

router.post("/", createRecord);

export default router;