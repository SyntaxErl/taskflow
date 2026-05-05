const db = require("../config/db");

const getTasks = async (req, res) => {
  const userId = req.user.userId;
  const { status, priority, category, sort, search } = req.query;

  try {
    let query = "SELECT * FROM tasks WHERE user_id = ?";
    let params = [userId];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (priority) {
      query += " AND priority = ?";
      params.push(priority);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    if (req.query.due_date) {
      query += " AND due_date = ?";
      params.push(req.query.due_date);
    }

    if (sort === "due_date") {
      query += " ORDER BY due_date ASC";
    } else if (sort === "priority") {
      query += " ORDER BY priority DESC";
    } else {
      query += " ORDER BY created_at DESC";
    }

    const [tasks] = await db.query(query, params);

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  const userId = req.user.userId;
  const {
    title,
    description,
    status,
    priority,
    category,
    due_date,
    due_time,
    assigned_to,
  } = req.body;

  try {
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO tasks 
        (user_id, assigned_to, title, description, status, priority, category, due_date, due_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        assigned_to || null,
        title,
        description || null,
        status || "todo",
        priority || "none",
        category || "others",
        due_date || null,
        due_time || null,
      ],
    );

    const [newTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  const {
    title,
    description,
    status,
    priority,
    category,
    due_date,
    due_time,
    assigned_to,
  } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = existing[0];

    await db.query(
      `UPDATE tasks SET 
        title = ?, description = ?, status = ?,
        priority = ?, category = ?, due_date = ?,
        due_time = ?, assigned_to = ?
       WHERE id = ? AND user_id = ?`,
      [
        title || task.title,
        description || task.description,
        status || task.status,
        priority || task.priority,
        category || task.category,
        due_date || task.due_date,
        due_time || task.due_time,
        assigned_to || task.assigned_to,
        taskId,
        userId,
      ],
    );

    const [updated] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      taskId,
    ]);

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updated[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    const [existing] = await db.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      taskId,
      userId,
    ]);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const bulkAction = async (req, res) => {
  const userId = req.user.userId;
  const { taskIds, action } = req.body;

  try {
    if (!taskIds || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tasks selected",
      });
    }

    if (action === "delete") {
      await db.query(`DELETE FROM tasks WHERE id IN (?) AND user_id = ?`, [
        taskIds,
        userId,
      ]);

      return res.json({
        success: true,
        message: "Tasks deleted successfully",
      });
    }

    if (action === "done") {
      await db.query(
        `UPDATE tasks SET status = 'done' WHERE id IN (?) AND user_id = ?`,
        [taskIds, userId],
      );

      return res.json({
        success: true,
        message: "Tasks marked as done",
      });
    }

    if (action === "priority") {
      const { priority } = req.body;

      await db.query(
        `UPDATE tasks SET priority = ? WHERE id IN (?) AND user_id = ?`,
        [priority, taskIds, userId],
      );

      return res.json({
        success: true,
        message: "Priority updated successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid action",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, bulkAction };
