
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from "../config/cloudinary.js"

export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("user", "name email profilePicture")
            .populate({
                path: "comments",
                select: "content",
                populate: {
                    path: "user",
                    select: "name email profilePicture",
                },
            });

        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: posts,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

export const getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const posts = await Post.findById(postId)
            .sort({ createdAt: -1 })
            .populate("user", "name email profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "name email profilePicture",
                },
            });

        if (!posts) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            data: posts,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch post",
        })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "name email profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "name email profilePicture",
                },
            });

        if (!posts) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: posts,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
        })
    }
}

export const createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const content = req.body.content;
        const imageFile = req.file;

        if (!content && !imageFile) {
            return res.status(400).json({
                success: false,
                message: "Post must contain either content or image",
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        let imageUrl = "";

        //upload image to cloudinary if provided
        if (imageFile) {
            try {
                //convert buffer to base64 for cloudinary
                const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

                const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                    folder: "social_media_posts",
                    resource_type: "image",
                    transformation: [
                        { width: 800, height: 600, crop: "limit" },
                        { quality: "auto" },
                        { format: "auto" },
                    ],
                });

                imageUrl = uploadResponse.secure_url;

            } catch (error) {
                console.log("Cloudinary upload error:", error);
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload image to Cloudinary",
                })
            }

        }

        const post = await Post.create({
            user: user._id,
            content: content || "",
            image: imageUrl,
        });

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create post",
        })
    }
}

export const updatePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const content = req.body.content;
        const imageFile = req.file;
        const { postId } = req.params;

        if (!content && !imageFile) {
            return res.status(400).json({
                success: false,
                message: "Post must contain either content or image",
            })
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        if (post.user.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this post",
            })
        }


        let imageUrl = "";

        //upload image to cloudinary if provided
        if (imageFile) {
            try {
                //convert buffer to base64 for cloudinary
                const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

                const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                    folder: "social_media_posts",
                    resource_type: "image",
                    transformation: [
                        { width: 800, height: 600, crop: "limit" },
                        { quality: "auto" },
                        { format: "auto" },
                    ],
                });

                imageUrl = uploadResponse.secure_url;

            } catch (error) {
                console.log("Cloudinary upload error:", error);
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload image to Cloudinary",
                })
            }

        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            {
                content: content || "",
                image: imageUrl || post.image,
            },
            { new: true }
        );

        res.status(201).json({
            success: true,
            message: "Post updated successfully",
            data: updatedPost,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update post",
        })
    }
}

export const likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        const user = await User.findById(userId);

        if (!post || !user) {
            return res.status(404).json({
                success: false,
                message: "Post or user not found",
            })
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            //if user has already liked the post, remove the like
            await Post.findByIdAndUpdate(postId, {
                $pull: { likes: userId },
            });
        } else {
            //if user has not liked the post, add the like
            await Post.findByIdAndUpdate(postId, {
                $push: { likes: userId },
            });

            //if the post is not ours send notification tot the user of ther post
            if (post.user.toString() !== user._id.toString()) {
                await Notification.create({
                    from: userId,
                    to: post.user,
                    type: "like",
                    post: postId,
                });
            }
        }

        res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked sucessfully" : "Post liked successfully",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to like post",
        })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        const user = await User.findById(userId);

        if (!post || !user) {
            return res.status(404).json({
                success: false,
                message: "Post or user not found",
            })
        }

        if (post.user.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post",
            })
        }

        //delete all comments associated with the post
        await Comment.deleteMany({ post: postId });

        //delete the post
        await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete post",
        })
    }
}
