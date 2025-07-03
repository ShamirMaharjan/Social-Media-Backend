import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const notifications = await Notification.find({
            to: user._id,
        })
            .sort({ createdAt: -1 })
            .populate("from", "name email profilePicture")
            .populate("post", "content image")
            .populate("comment", "content");

        res.status(200).json({
            success: true,
            data: {
                notifications,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export const deleteNotification = async (req, res) => {
    try {

        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            to: user._id,
        })

        if (!notification) return res.status(404).json({ message: "Notification not found" });

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}