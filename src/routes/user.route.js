import { Router } from "express";
import { followUser, getCurrentUser, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const userRouter = Router();


userRouter.get("/profile/:username", getUserProfile);

userRouter.get("/me", protectRoute, getCurrentUser);
userRouter.put("/profile", protectRoute, updateUserProfile);
userRouter.post("/follow/:targetUserId", protectRoute, followUser);

export default userRouter;  