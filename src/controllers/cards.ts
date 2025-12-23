import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import mongoose from "mongoose";
import StatusCodes from '../constants/status-codes';

const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});

    if (cards.length === 0) {
      next(HttpError.notFound({ message: 'Карточки не найдены' }));
    } else {
      res.status(StatusCodes.OK).send(cards);
    }
  } catch (err) {
    next(err);
  }
};

const createCard = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    link,
  } = req.body;
  const owner = (req as RequestWithUser).user._id;

  try {
    const card = await Card.create({
      name,
      link,
      owner,
    });

    res.status(StatusCodes.CREATED).send(card);
  } catch (err) {
    next(err);
  }
};

const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findById(req.params.cardId).orFail(() => HttpError.notFound({ message: 'Карточка с указанным _id не найдена.' }));

    if (card.owner.toString() !== (req as RequestWithUser).user._id) {
      next(HttpError.forbidden({ message: 'Недостаточно прав доступа для этой операции' }));
    } else {
      const cardInfo = await Card.findByIdAndDelete(req.params.cardId);
      res.send(cardInfo);
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      next(HttpError.badRequest({ message: 'Передан некорректный _id карточки.' }));
    } else {
      next(err);
    }
  }
};

const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  const owner = (req as RequestWithUser).user._id;

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: owner } },
      { new: true },
    ).orFail(() => HttpError.notFound({ message: 'Передан несуществующий _id карточки.' }));

    res.status(StatusCodes.OK).send(card);
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      next(HttpError.badRequest({ message: 'Переданы некорректные данные для постановки лайка или некорректный _id карточки.' }));
    } else {
      next(err);
    }
  }
};

const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  const owner = (req as RequestWithUser).user._id;

  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: owner } },
      { new: true },
    ).orFail(() => HttpError.notFound({ message: 'Передан несуществующий _id карточки.' }));

    res.status(StatusCodes.OK).send(card);
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      next(HttpError.badRequest({ message: 'Переданы некорректные данные для снятия лайка или некорректный _id карточки.' }));
    } else {
      next(err);
    }
  }
};

export {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};