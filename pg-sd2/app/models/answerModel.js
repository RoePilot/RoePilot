// answerModel.js
const db = require('../services/db');

async function upvoteAnswer(answerId, userId) {
  try {
    // Ensure parameters are valid
    if (!answerId || !userId) {
      throw new Error('Missing answerId or userId');
    }

    // Check if user has already upvoted
    const checkSql = "SELECT * FROM answer_upvotes WHERE AnswerID = ? AND UserID = ?";
    const checkResult = await db.query(checkSql, [answerId, userId]);

    if (checkResult.length > 0) {
      return { success: false, message: "User has already upvoted this answer" };
    }

    // Start a transaction to ensure both queries succeed or fail together
    await db.query('START TRANSACTION');

    // Record the upvote
    const insertSql = "INSERT INTO answer_upvotes (AnswerID, UserID) VALUES (?, ?)";
    await db.query(insertSql, [answerId, userId]);

    // Update the counter
    const updateSql = "UPDATE answers SET NumOfUpvote = NumOfUpvote + 1 WHERE AnswerID = ?";
    await db.query(updateSql, [answerId]);

    await db.query('COMMIT');
    
    return { success: true };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

module.exports = {
  upvoteAnswer
};