const router = require("express").Router();
const {
  articleValidation,
  idValidation,
} = require("../middlewares/joiValidation");
const {
  getArticles,
  postArticle,
  deleteArticle,
} = require("../controllers/articles");

router.get("/articles", getArticles);
router.post("/articles", articleValidation, postArticle);
router.delete("/articles/articleId", idValidation, deleteArticle);

module.exports = router;
