function downvoteAnswer(answerId) {
  const sql = "UPDATE answers SET NumOfUpvote = NumOfUpvote - 1 WHERE AnswerID = ? AND NumOfUpvote > 0";
  return db.query(sql, [answerId]);
}

module.exports = {
  upvoteAnswer,
  downvoteAnswer // 
};