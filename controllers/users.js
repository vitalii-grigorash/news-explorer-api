const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new Error('NotValidUserId'))
    .catch((err) => {
      if (err.message === 'NotValidUserId') {
        throw new NotFoundError({ message: 'Нет пользователя с таким id' });
      } else {
        throw new BadRequestError({ message: 'Переданы некорректные данные' });
      }
    })
    .then((user) => {
      res.status(200).send({
        data: {
          name: user.name, email: user.email,
        },
      });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError({ message: 'Пользователь с таким email уже существует' });
      } else next(err);
    })
    .then((user) => res.status(201).send({
      data: {
        name: user.name, email: user.email,
      },
    }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getUser,
  createUser,
  login,
};
