import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minLenght: 5,
        maxLenght: 50
    },
    email: {
        type: String,
        required: [true, "User email is required"],
        trim: true,
        unique: true,
        minLenght: 5,
        maxLenght: 50,
        match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        minLenght: 6
    },
    profilePicture: {
        type: String,
        default: ""
    },
    bannerImage: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
        maxLength: 160,
    },
    location: {
        type: String,
        default: ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

},
    { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User;