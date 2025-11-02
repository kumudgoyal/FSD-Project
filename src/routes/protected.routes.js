import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/roleCheck.js";

const router = express.Router();

// 🧠 Common route (any logged-in user)
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your dashboard!",
    user: req.user,
  });
});

// 🛡️ Admin-only route
router.get("/admin", verifyToken, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: "Welcome, Admin!", user: req.user });
});

// ✍️ Editor-only route
router.get("/editor", verifyToken, authorizeRoles("Editor"), (req, res) => {
  res.json({ message: "Welcome, Editor!",user: req.user });
});
// 👀 Viewer-only route
router.get("/viewer", verifyToken, authorizeRoles("Admin", "Editor", "Viewer"), (req, res) => {
  res.json({ message: "Welcome, Viewer!", user: req.user });
});
export default router;
