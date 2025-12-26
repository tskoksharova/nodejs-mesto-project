import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import StatusCodes from '../constants/status-codes';
import User from '../models/user';

const { JWT_SECRET = 'dev-secret', NODE_ENV } = process.env;

type AuthRequest = Request & {
  user?: { _id: string };
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await (User as any).findUserByCredentials(email, password);

    const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: NODE_ENV === 'production',
    });

    return res.status(StatusCodes.OK).send({ message: 'ok' });
  } catch (e) {
    const err: any = new Error('Неправильные почта или пароль');
    err.statusCode = StatusCodes.UNAUTHORIZED;
    return next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about, avatar, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    });

    return res.status(StatusCodes.CREATED).send({
      _id: user._id,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      const err: any = new Error('Пользователь с таким email уже существует');
      err.statusCode = StatusCodes.CONFLICT;
      return next(err);
    }
    if (e?.name === 'ValidationError') {
      const err: any = new Error('Переданы некорректные данные');
      err.statusCode = StatusCodes.BAD_REQUEST;
      return next(err);
    }
    return next(e);
  }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    return res.status(StatusCodes.OK).send(users);
  } catch (e) {
    return next(e);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      const err: any = new Error('Пользователь не найден');
      err.statusCode = StatusCodes.NOT_FOUND;
      return next(err);
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (e: any) {
    if (e?.name === 'CastError') {
      const err: any = new Error('Некорректный id пользователя');
      err.statusCode = StatusCodes.BAD_REQUEST;
      return next(err);
    }
    return next(e);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);
    if (!user) {
      const err: any = new Error('Пользователь не найден');
      err.statusCode = StatusCodes.NOT_FOUND;
      return next(err);
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (e) {
    return next(e);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { name, about } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!user) {
      const err: any = new Error('Пользователь не найден');
      err.statusCode = StatusCodes.NOT_FOUND;
      return next(err);
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (e: any) {
    if (e?.name === 'ValidationError' || e?.name === 'CastError') {
      const err: any = new Error('Переданы некорректные данные');
      err.statusCode = StatusCodes.BAD_REQUEST;
      return next(err);
    }
    return next(e);
  }
};

export const updateUserAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const { avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      const err: any = new Error('Пользователь не найден');
      err.statusCode = StatusCodes.NOT_FOUND;
      return next(err);
    }

    return res.status(StatusCodes.OK).send(user);
  } catch (e: any) {
    if (e?.name === 'ValidationError' || e?.name === 'CastError') {
      const err: any = new Error('Переданы некорректные данные');
      err.statusCode = StatusCodes.BAD_REQUEST;
      return next(err);
    }
    return next(e);
  }
};
