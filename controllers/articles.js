const Article = require("../models/article");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const ForbiddenError = require("../errors/ForbiddenError");

const getArticles = (req, res, next) => {
  const ownerId = req.user._id;
  Article.find({ owner: ownerId })
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch(next);
};

const postArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;
  const ownerId = req.user._id;

  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: ownerId,
  })
    .catch(() => {
      throw new BadRequestError({ message: "Переданы некорректные данные" });
    })
    .then((article) => res.send({ data: article }))
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findById(req.params._id)
    .orFail(new Error("NotValidArticleId"))
    .catch((err) => {
      if (err.message === "NotValidArticleId") {
        throw new NotFoundError({ message: "Статья не найдена" });
      } else {
        throw new BadRequestError({ message: "Переданы некорректные данные" });
      }
    })
    .then((article) => {
      if (article.owner.toString() !== req.user._id) {
        throw new ForbiddenError({ message: "Недостаточно прав для удаления статьи" });
      }
      Article.findByIdAndDelete(req.params._id)
        .then((articleData) => {
          res.send({ data: articleData });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = {
  getArticles,
  postArticle,
  deleteArticle,
};
