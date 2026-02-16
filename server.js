import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import route from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import blogRoute from "./routes/blogRoute.js";

dotenv.config();
const app = express();

// ===== Mongo Cache =====
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL).then((mongoose) => {
      console.log("MongoDB Connected");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ===== CORS Policy =====
const corsPolicy = {
  origin: "https://blogging-app-blog-hub.vercel.app",
  credentials: true,
};

// ===== Middlewares =====
app.use(express.json());
app.use(cors(corsPolicy));
app.use(cookieParser());

// 🔥 DB Middleware (IMPORTANT)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ===== Routes =====
app.use("/user", route);
app.use("/blogs", blogRoute);

// ===== Test Route =====
app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

export default app;