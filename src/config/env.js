import { config } from "dotenv";

// const envName = 'development';
// config({ path: `.env.${envName}.local` });

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    PORT,
    NODE_ENV,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN
} = process.env;