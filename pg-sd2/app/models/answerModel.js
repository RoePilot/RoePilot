const db = require('../services/db');

function upvoteAnswer(answerId) {
  const sql = "UPDATE answers SET NumOfUpvote = NumOfUpvote + 1 WHERE AnswerID = ?";
  return db.query(sql, [answerId]);
}

module.exports = {
  upvoteAnswer
};