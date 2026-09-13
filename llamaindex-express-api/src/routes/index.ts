import {Router} from "express";
import queryRoutes from "./query";

const routes = Router();

console.log("Setting up routes...");
routes.use('/query', queryRoutes);

export default routes;