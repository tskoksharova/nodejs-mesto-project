import {
  Document,
  Schema,
  model, Model,
} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { isValidUrl } from '../utils/url';
import HttpError from '../errors/http-error';

export interface IUser extends Document {
  name: string
  about: string
  avatar: string
  email: string
  password: string
}

interface UserModel extends Model<IUser> {
  // eslint-disable-next-line no-unused-vars
  findUserByCredentials: (email: string, password: string) => Promise<Document<unknown, any, IUser>>
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator: isValidUrl,
      message: 'Некорректный URL аватара',
    },
    default:
      'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (emailLink: string) => validator.isEmail(emailLink),
      message: 'Email указан неверно',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(HttpError.unauthorized({ message: 'Неправильные почта или пароль' }));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(HttpError.unauthorized({ message: 'Неправильные почта или пароль' }));
          }
          return user;
        });
    });
};

export default model<IUser, UserModel>('user', userSchema);