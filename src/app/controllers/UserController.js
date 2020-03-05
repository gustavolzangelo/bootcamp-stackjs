import * as Yup from 'yup';
import bcrypt from 'bcryptjs';
import User from '../models/Users';
import File from '../models/File';

class UserController {
  async store(req, res) {
    if (await this.checkIfInputStoreIsInvalid(req)) {
      return res.status(400).json({ error: 'Validation failed' });
    }
    if (await this.checkIfUserExist(req)) {
      return res.status(400).json({ error: 'User already exist.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const { oldPassword, email } = req.body;
    const user = await User.findByPk(req.userId);

    if (await this.checkIfInputUpdateIsInvalid(req)) {
      return res.status(400).json({ error: 'Validation error' });
    }

    if (user.email !== req.body.email && (await this.checkIfEmailExist(req))) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    if (
      oldPassword &&
      !(await this.checkIfHashPasswordMatch(oldPassword, user.password_hash))
    ) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }

  async checkIfInputStoreIsInvalid(req) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    return !(await schema.isValid(req.body));
  }

  async checkIfUserExist(req) {
    return User.findOne({ where: { email: req.body.email } });
  }

  async checkIfInputUpdateIsInvalid(req) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string()
        .required()
        .min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    return !(await schema.isValid(req.body));
  }

  async checkIfEmailExist(req) {
    const { email } = req.body;

    return User.findOne({
      where: { email },
    });
  }

  async checkIfHashPasswordMatch(password, password_hash) {
    return !bcrypt.compare(password, password_hash);
  }
}

export default new UserController();
