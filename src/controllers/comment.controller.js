import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ message: "Post not found" });

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate("user", "name email profilePicture");

        res.status(200).json({
            success: true,
            data: {
                comments
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const user = await User.findById(userId);
        const post = await Post.findById(postId);

        if (!user || !post) {
            return res.status(404).json({ message: "User or post not found" });
        }

        const comment = await Comment.create({
            user: user._id,
            post: postId,
            content,
        });

        await Post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id }
        });

        if (post.user.toString() !== user._id.toString()) {
            const notification = await Notification.create({
                from: user._id,
                to: post.user,
                type: "comment",
                post: postId,
                comment: comment._id,
            });
            // Emit WebSocket event for notification
            try {
                const io = req.app.get('socketio');
                if (io) {
                    io.to(post.user.toString()).emit('notificationReceived', notification);
                }
            } catch (error) {
                console.error('Failed to emit notification:', error);
            }
        }

        res.status(201).json({
            success: true,
            data: {
                comment
            }
        })

        try {
            const io = req.app.get('socketio');
            // Emit WebSocket event after successful creation
            if (io) {
                io.emit('commentAdded', comment);
            }
        } catch (error) {
            console.error('Failed to emit notification:', error);
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        const user = await User.findById(userId);

        if (!comment || !user) {
            return res.status(404).json({ message: "Comment or user not found" });
        }

        if (comment.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id }
        });

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const likeComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.id;

        const comment = await Post.findById(commentId);
        const user = await User.findById(userId);

        if (!comment || !user) {
            return res.status(404).json({
                success: false,
                message: "Comment or user not found",
            })
        }

        const isLiked = comment.likes.includes(userId);

        if (isLiked) {
            //if user has already liked the comment, remove the like
            await Comment.findByIdAndUpdate(commentId, {
                $pull: { likes: userId },
            });
        } else {
            //if user has not liked the comment, add the like
            await Post.findByIdAndUpdate(commentId, {
                $push: { likes: userId },
            });

            //if the comment is not ours send notification tot the user of ther post
            // if (comment.user.toString() !== user._id.toString()) {
            //     await Notification.create({
            //         from: userId,
            //         to: comment.user,
            //         type: "like",
            //         comment: commentId,
            //     });
            // }
        }

        res.status(200).json({
            success: true,
            message: isLiked ? "Comment unliked sucessfully" : "Comment liked successfully",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to like Comment",
        })
    }
}