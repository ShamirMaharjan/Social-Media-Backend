import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteNotification, getNotifications } from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/", protectRoute, getNotifications);
notificationRouter.delete("/:notificationId", protectRoute, deleteNotification);


export default notificationRouter;