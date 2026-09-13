import express from "express";
import { PORT } from "./config";
import routes from "./routes";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
