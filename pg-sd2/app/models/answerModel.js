// answerModel.js
const db = require('../services/db');

async function upvoteAnswer(answerId, userId) {
  try {
    if (!answerId || !userId) {
      throw new Error('Missing answerId or userId');
    }
    console.log(`Checking upvote for answerId: ${answerId}, userId: ${userId}`);
    const checkSql = "SELECT * FROM answer_upvotes WHERE AnswerID = ? AND UserID = ?";
    const checkResult = await db.query(checkSql, [answerId, userId]);
    console.log("Check result:", checkResult);

    if (checkResult.length > 0) {
      return { success: false, message: "User has already upvoted this answer" };
    }

    console.log("Starting transaction");
    await db.query('START TRANSACTION');
    const insertSql = "INSERT INTO answer_upvotes (AnswerID, UserID) VALUES (?, ?)";
    await db.query(insertSql, [answerId, userId]);
    console.log("Upvote recorded");
    const updateSql = "UPDATE answers SET NumOfUpvote = NumOfUpvote + 1 WHERE AnswerID = ?";
    await db.query(updateSql, [answerId]);
    console.log("Counter updated");
    await db.query('COMMIT');
    console.log("Transaction committed");
    return { success: true };
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query('ROLLBACK');
    throw error;
  }
}