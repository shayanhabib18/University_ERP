import express from "express";
import AdminLogin from "../controllers/LoginController.js"
const router = express.Router()

router.post('/login/admin', AdminLogin)


export default router;