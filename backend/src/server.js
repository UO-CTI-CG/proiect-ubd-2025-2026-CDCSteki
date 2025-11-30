import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log(PORT);

app.use(express.json());
app.use(cors());

app.use(helmet()); //helmet is a security middleware that helps you protect your app by setting various HTTP headers.

app.use(morgan("dev"));     

app.get("/api/records", (req, res) => {
    //GET ALL RECORDS FORM DB

    res.status(200).json({
        sucess: true,
        data: [] //replace with actual data from DB
    })
});

app.listen(3000, () => {
    console.log("Server is running on port " + PORT);
});