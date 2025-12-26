import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import StatusCodes from '../constants/status-codes';

const { JWT_SECRET = 'dev-secret' } = process.env;

type AuthRequest = Request & {
  user?: { _id: string };
};

export default (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      const err: any = new Error('Необходима авторизация');
      err.statusCode = StatusCodes.UNAUTHORIZED;
      return next(err);
    }

    const payload = jwt.verify(token, JWT_SECRET) as { _id: string };
    req.user = payload;

    return next();
  } catch (e) {
    const err: any = new Error('Необходима авторизация');
    err.statusCode = StatusCodes.UNAUTHORIZED;
    return next(err);
  }
};
