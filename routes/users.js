const router = require('express').Router();
const {
  idValidation,
} = require('../middlewares/joiValidation');
const {
  getUser,
} = require('../controllers/users');

router.get('/users/me', idValidation, getUser);

module.exports = router;
