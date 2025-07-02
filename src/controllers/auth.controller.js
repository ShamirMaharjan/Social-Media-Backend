import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //destructure the body
        const { name, email, password } = req.body;

        //check if user already exits
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hassedPassword = await bcrypt.hash(password, salt);

        //create new user
        const newUsers = await User.create([{ name, email, password: hassedPassword }], { session });

        //generate token
        const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            message: "user created successfully",
            data: {
                token,
                user: newUsers[0]
            }
        })

    } catch (error) {
        session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        //if user exists then we compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        //if wrong password
        if (!isPasswordValid) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        //generate token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user
            }
        })


    } catch (error) {
        next(error);
    }

};

export const signOut = async (req, res, next) => { };