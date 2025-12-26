import {
  Document,
  Schema,
  model,
  Model,
} from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export const urlRegex = /^https?:\/\/(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[0-9a-zA-Z\-._~:/?#[\]@!$&'()*+,;=]*)?\/?#?$/;

export interface IUser extends Document {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

export interface IUserModel extends Model<IUser> {
  findUserByCredentials(email: string, password: string): Promise<IUser>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
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
      default: 'https://pictures.s3.yandex.net/resources/avatar_1604080799.jpg',
      validate: {
        validator: (v: string) => urlRegex.test(v),
        message: 'Некорректная ссылка на аватар',
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v: string) => validator.isEmail(v),
        message: 'Некорректный email',
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.statics.findUserByCredentials = function (email: string, password: string) {
  return this.findOne({ email }).select('+password')
    .then((user: IUser | null) => {
      if (!user) {
        const err: any = new Error('Неправильные почта или пароль');
        err.statusCode = 401;
        throw err;
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          const err: any = new Error('Неправильные почта или пароль');
          err.statusCode = 401;
          throw err;
        }
        return user;
      });
    });
};

export default model<IUser, IUserModel>('user', userSchema);
