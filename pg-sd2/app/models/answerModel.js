const db = require('../services/db');

// Function to upvote an answer, ensuring only one upvote per user per answer
function upvoteAnswer(userId, answerId) {
  const insertSql = "INSERT INTO upvotes (user_id, answer_id) VALUES (?, ?)";
  return db.query(insertSql, [userId, answerId])
    .then(() => {
      // If insert succeeds, increment NumOfUpvote
      const updateSql = "UPDATE answers SET NumOfUpvote = NumOfUpvote + 1 WHERE AnswerID = ?";
      return db.query(updateSql, [answerId]);
    })
    .catch(error => {
      if (error.code === 'ER_DUP_ENTRY') {
        // User has already upvoted
        return Promise.reject("Already upvoted");
      }
      // Other errors (e.g., invalid answerId)
      return Promise.reject(error);
    });
}

module.exports = {
  upvoteAnswer
};