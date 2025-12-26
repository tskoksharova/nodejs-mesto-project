import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import StatusCodes from '../constants/status-codes';

type AuthRequest = Request & {
  user?: { _id: string };
};

const getCards = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({});
    return res.status(StatusCodes.OK).send(cards);
  } catch (err) {
    return next(err);
  }
};

const createCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const owner = req.user?._id;

  if (!owner) {
    const error: any = new Error('Необходима авторизация');
    error.statusCode = StatusCodes.UNAUTHORIZED;
    return next(error);
  }

  if (!name || !link) {
    const error: any = new Error('Поля name и link обязательны');
    error.statusCode = StatusCodes.BAD_REQUEST;
    return next(error);
  }

  try {
    const card = await Card.create({ name, link, owner });
    return res.status(StatusCodes.CREATED).send(card);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      err.statusCode = StatusCodes.BAD_REQUEST;
    }
    return next(err);
  }
};

const deleteCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error: any = new Error('Необходима авторизация');
      error.statusCode = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const card = await Card.findById(req.params.cardId);

    if (!card) {
      const error: any = new Error('Карточка с указанным _id не найдена.');
      error.statusCode = StatusCodes.NOT_FOUND;
      return next(error);
    }

    if (card.owner.toString() !== userId) {
      const error: any = new Error('Нельзя удалить чужую карточку');
      error.statusCode = StatusCodes.FORBIDDEN;
      return next(error);
    }

    await card.deleteOne();
    return res.status(StatusCodes.OK).send({ message: 'Карточка удалена' });
  } catch (err: any) {
    if (err.name === 'CastError') {
      err.statusCode = StatusCodes.BAD_REQUEST;
      err.message = 'Передан некорректный _id карточки.';
    }
    return next(err);
  }
};

const likeCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error: any = new Error('Необходима авторизация');
      error.statusCode = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!card) {
      const error: any = new Error('Передан несуществующий _id карточки.');
      error.statusCode = StatusCodes.NOT_FOUND;
      return next(error);
    }

    return res.status(StatusCodes.OK).send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      err.statusCode = StatusCodes.BAD_REQUEST;
      err.message = 'Переданы некорректные данные для постановки лайка или некорректный _id карточки.';
    }
    return next(err);
  }
};

const dislikeCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      const error: any = new Error('Необходима авторизация');
      error.statusCode = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      const error: any = new Error('Передан несуществующий _id карточки.');
      error.statusCode = StatusCodes.NOT_FOUND;
      return next(error);
    }

    return res.status(StatusCodes.OK).send(card);
  } catch (err: any) {
    if (err.name === 'CastError') {
      err.statusCode = StatusCodes.BAD_REQUEST;
      err.message = 'Переданы некорректные данные для снятия лайка или некорректный _id карточки.';
    }
    return next(err);
  }
};

export { getCards, createCard, deleteCard, likeCard, dislikeCard };
