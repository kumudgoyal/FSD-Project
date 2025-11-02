import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import Post from "../models/user.model.js";

const router = express.Router();

// 🟢 Create Post – Editors & Admins can create
router.post("/", verifyToken, checkRole("Admin", "Editor"), async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔵 Read Posts – All roles can view
router.get("/", verifyToken, checkRole("Admin", "Editor", "Viewer"), async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// 🟠 Update Post – Editors can edit their own, Admins can edit any
router.put("/:id", verifyToken, checkRole("Admin", "Editor"), async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "Admin" && post.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "You can only update your own posts" });
  }

  post.title = req.body.title || post.title;
  post.content = req.body.content || post.content;
  await post.save();
  res.json({ message: "Post updated", post });
});

// 🔴 Delete Post – Only Admins or Owner
router.delete("/:id", verifyToken, checkRole("Admin", "Editor"), async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "Admin" && post.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }

  await post.deleteOne();
  res.json({ message: "Post deleted" });
});

export default router;
