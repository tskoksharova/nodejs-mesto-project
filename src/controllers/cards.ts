import { Request, Response, NextFunction } from "express";
import Card from "../models/card";
import StatusCodes from "../constants/status-codes";

const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});

    if (cards.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Карточки не найдены" });
    }

    return res.status(StatusCodes.OK).send(cards);
  } catch (err) {
    return next(err);
  }
};

const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const { name, link, owner } = req.body;

  if (!name || !link || !owner) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      message: "Поля name, link и owner обязательны",
    });
  }

  try {
    const card = await Card.create({ name, link, owner });
    return res.status(StatusCodes.CREATED).send(card);
  } catch (err) {
    return next(err);
  }
};

const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cardInfo = await Card.findByIdAndDelete(req.params.cardId);

    if (!cardInfo) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Карточка с указанным _id не найдена." });
    }

    return res.status(StatusCodes.OK).send(cardInfo);
  } catch (err) {
    if (err instanceof Error && err.name === "CastError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ message: "Передан некорректный _id карточки." });
    }
    return next(err);
  }
};

const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "Для лайка нужен userId (в body)" });
  }

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!card) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Передан несуществующий _id карточки." });
    }

    return res.status(StatusCodes.OK).send(card);
  } catch (err) {
    if (err instanceof Error && err.name === "CastError") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message:
          "Переданы некорректные данные для постановки лайка или некорректный _id карточки.",
      });
    }
    return next(err);
  }
};

const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ message: "Для снятия лайка нужен userId (в body)" });
  }

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!card) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Передан несуществующий _id карточки." });
    }

    return res.status(StatusCodes.OK).send(card);
  } catch (err) {
    if (err instanceof Error && err.name === "CastError") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message:
          "Переданы некорректные данные для снятия лайка или некорректный _id карточки.",
      });
    }
    return next(err);
  }
};

export { getCards, createCard, deleteCard, likeCard, dislikeCard };
