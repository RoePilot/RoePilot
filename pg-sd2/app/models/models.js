const db = require("./services/db");

function upvoteAnswer(answerId) {
  const sql = "UPDATE answers SET NumOfUpvotes = NumOfUpvotes + 1 WHERE AnswerID = ?";
  return db.query(sql, [answerId]);
}

module.exports = {
  upvoteAnswer,
};
