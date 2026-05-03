const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkAction,
} = require("../controllers/task.controller");

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.patch("/bulk", authMiddleware, bulkAction);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
