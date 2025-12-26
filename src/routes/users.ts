import { Router } from 'express';
import {
  getUsers,
  getUser,
  getMe,
  updateUser,
  updateUserAvatar,
} from '../controllers/users';

const usersRouter = Router();

usersRouter.get('/', getUsers);

usersRouter.get('/me', getMe);

usersRouter.get('/:userId', getUser);

usersRouter.patch('/me', updateUser);
usersRouter.patch('/me/avatar', updateUserAvatar);

export default usersRouter;
