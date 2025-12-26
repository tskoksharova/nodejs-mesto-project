import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { celebrate, Joi, errors } from 'celebrate';

import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string(),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.use('/users', auth, usersRouter);
app.use('/cards', auth, cardsRouter);

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).send({ message: 'Ресурс не найден' });
});

app.use(errorLogger);
app.use(errors());

app.use(
  (err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const { statusCode = 500, message } = err;
    res.status(statusCode).send({
      message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
    });
  },
);

mongoose
  .connect('mongodb://127.0.0.1:27017/mestodb')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(Number(PORT), '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
