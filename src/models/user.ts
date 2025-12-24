import {
  Document,
  Schema,
  model,
} from 'mongoose';

export interface IUser extends Document {
  name: string
  about: string
  avatar: string
}

const userSchema = new Schema<IUser>(
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
      required: true,
    },
  });

export default model<IUser>("user", userSchema);