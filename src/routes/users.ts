import { Router } from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
} from "../controllers/users";

const usersRouter = Router();

usersRouter.get("/", getUsers);
usersRouter.get("/:userId", getUser);

usersRouter.post("/", createUser);

usersRouter.patch("/:userId", updateUser);
usersRouter.patch("/:userId/avatar", updateUserAvatar);

export default usersRouter;