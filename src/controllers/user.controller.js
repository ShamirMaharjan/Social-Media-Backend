import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.find({ name: username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            success: true,
            data: {
                user
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (name && name.trim() === "") return res.status(400).json({ error: "Name cannot be empty" });
        if (email && email.trim() === "") return res.status(400).json({ error: "Email cannot be empty" });
        if (password && password.trim() === "") return res.status(400).json({ error: "Password cannot be empty" });

        const user = await User.findOneAndUpdate({ _id: req.user.id }, req.body, { new: true });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            success: true,
            message: "User profile updated successfully",
            data: {
                user
            }
        })

    } catch (error) {
        console.log(error);
    }
}

export const getCurrentUser = async (req, res) => {
    try {


        const user = await User.findOne({ _id: req.user.id });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            success: true,
            data: {
                user
            }
        })

    } catch (error) {
        console.log(error);
    }
}

export const followUser = async (req, res) => {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    if (userId === targetUserId) return res.status(400).json({ error: "You cannot follow yourself" });

    const currentUser = await User.findById(userId);

    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
        //if already following, unfollow
        await User.findByIdAndUpdate(currentUser._id, {
            $pull: { following: targetUserId },
        })

        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUser._id },
        });
    } else {
        //if not following, follow
        await User.findByIdAndUpdate(currentUser._id, {
            $push: { following: targetUserId },
        });

        await User.findByIdAndUpdate(targetUserId, {
            $push: { followers: currentUser._id },
        });

        //after following, send notification to target user
        const notification = await Notification.create({
            from: currentUser._id,
            to: targetUserId,
            type: "follow",
        });

        try {
            const io = req.app.get('socketio');
            if (io) {
                io.to(targetUser._id.toString()).emit('followNotification', notification);
            }
        } catch (error) {
            console.error('Failed to emit notification:', error);
        }
    }

    res.status(200).json({
        success: true,
        message: isFollowing ? "User Unfollowed successfully" : "User Followed successfully",
    })
}

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: "User not found" });

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        })

    } catch (error) {
        console.log(error);
        req.status(500).json(error);
    }
}