import { Router } from "express";
import { createComment, deleteComment, getComments, likeComment } from "../controllers/comment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const commentRouter = Router();

commentRouter.get("/post/:postId", getComments);

commentRouter.post("/post/:postId", protectRoute, createComment);

commentRouter.delete("/:commentId", protectRoute, deleteComment);

commentRouter.post("/:commentId/like", protectRoute, likeComment);

export default commentRouter;