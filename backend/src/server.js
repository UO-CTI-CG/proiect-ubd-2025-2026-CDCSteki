import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import records from "../routes/records.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT);

app.use(express.json());
app.use(cors());

app.use(helmet()); //helmet is a security middleware that helps you protect your app by setting various HTTP headers.

app.use(morgan("dev"));     

app.use("/api/records", records)

app.listen(3000, () => {
    console.log("Server is running on port " + PORT);
});