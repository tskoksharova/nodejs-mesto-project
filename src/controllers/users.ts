import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../models/user";
import StatusCodes from "../constants/status-codes";

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Пользователи не добавлены" });
    }

    return res.status(StatusCodes.OK).send(users);
  } catch (err) {
    return next(err);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Передан некорректный _id пользователя." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Пользователь по указанному _id не найден." });
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (err) {
    return next(err);
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      message: "Поля name, about и avatar обязательны",
    });
  }

  try {
    const user = await User.create({ name, about, avatar });
    return res.status(StatusCodes.CREATED).send(user);
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "Передан некорректный _id пользователя." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Пользователь с указанным _id не найден." });
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (err) {
    return next(err);
  }
};

const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  const { userId } = req.params;

  if (!avatar) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "Поле avatar обязательно" });
  }

  if (!mongoose.isValidObjectId(userId)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "Передан некорректный _id пользователя." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Пользователь с указанным _id не найден." });
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (err) {
    return next(err);
  }
};

export {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserAvatar,
};