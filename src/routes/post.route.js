import { Router } from "express";
import { createPost, deletePost, getPost, getPosts, getUserPost, likePost } from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const postRouter = Router();

//public route
postRouter.get("/", getPosts);
postRouter.get("/:postId", getPost);
postRouter.get("/user/:userId", getUserPost)

//private route
postRouter.post("/", protectRoute, upload.single("image"), createPost);
postRouter.post("/:postId/like", protectRoute, likePost);
postRouter.delete("/:postId", protectRoute, deletePost);
export default postRouter;