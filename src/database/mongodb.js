import { MONGO_URI, NODE_ENV } from "../config/env.js"
import mongoose from "mongoose"

if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined")
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log(`Connected to database: ${NODE_ENV} mode`);

    } catch (error) {
        console.log("Error connecting to database: ", error)
    }

}

export default connectToDatabase;
