import { Router } from "express";

import { deleteUser, followUser, getCurrentUser, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const userRouter = Router();

//public route
userRouter.get("/profile/:username", getUserProfile);

//protected route
userRouter.get("/me", protectRoute, getCurrentUser);
userRouter.put("/profile", protectRoute, updateUserProfile);
userRouter.post("/follow/:targetUserId", protectRoute, followUser);
userRouter.delete("/delete", protectRoute, deleteUser);

export default userRouter;  