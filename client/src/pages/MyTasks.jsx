import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getTasks, bulkAction as bulkActionService, updateTask, deleteTask } from "../services/taskService";
import useTaskStore from "../store/taskStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryColor = (category) => {
  const colors = {
    work:     { bg: "#ede9fe", text: "#5b4fcf" },
    personal: { bg: "#dcfce7", text: "#16a34a" },
    school:   { bg: "#dbeafe", text: "#2563eb" },
    fitness:  { bg: "#fce7f3", text: "#db2777" },
    others:   { bg: "#f3f4f6", text: "#6b7280" },
  };
  return colors[category] || colors.others;
};

const getPriorityColor = (priority) => {
  const colors = {
    high:   { bg: "#fee2e2", text: "#ef4444", dot: "#ef4444" },
    medium: { bg: "#fff7ed", text: "#f97316", dot: "#f97316" },
    low:    { bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
    none:   { bg: "#f3f4f6", text: "#9ca3af", dot: "#9ca3af" },
  };
  return colors[priority] || colors.none;
};

const getStatusStyle = (status) => {
  const styles = {
    todo:        { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
    in_progress: { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" },
    done:        { bg: "#f0fdf4", text: "#22c55e", border: "#bbf7d0" },
  };
  return styles[status] || styles.todo;
};

const getStatusLabel = (status) =>
  ({ todo: "Todo", in_progress: "In Progress", done: "Done" }[status] || status);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const getDaysLeft = (dueDate, status) => {
  if (!dueDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (status === "done") return null;
  if (diff < 0)   return { label: "Overdue",     color: "#ef4444" };
  if (diff === 0) return { label: "Due today",   color: "#f97316" };
  if (diff === 1) return { label: "1 day left",  color: "#f97316" };
  return { label: `${diff} days left`, color: "#6b7280" };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyTasks() {
  const navigate = useNavigate();
  const taskVersion         = useTaskStore((s) => s.taskVersion);
  const clearDashboardStats = useTaskStore((s) => s.clearDashboardStats);

  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("due_date");
  const [page,     setPage]     = useState(1);
  const [perPage]               = useState(10);
  const [selected, setSelected] = useState([]);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPos,    setDropdownPos]    = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);

  // Close dropdown on outside click / scroll
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdownId(null);
    };
    const closeOnScroll = () => setOpenDropdownId(null);
    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search)   params.search   = search;
      if (status)   params.status   = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (sort)     params.sort     = sort;
      const res = await getTasks(params);
      setTasks(res.data.tasks || []);
      setTotal(res.data.total || res.data.tasks?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, sort, page, perPage, taskVersion]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setPage(1); setSelected([]); }, [search, status, priority, category, sort]);

  const allSelected  = tasks.length > 0 && selected.length === tasks.length;
  const someSelected = selected.length > 0;
  const totalPages   = Math.ceil(total / perPage);
  const toggleAll    = () => setSelected(allSelected ? [] : tasks.map((t) => t.id));
  const toggleOne    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const bulkAction = async (action, extra = {}) => {
    try {
      await bulkActionService(selected, action, extra);
      clearDashboardStats();
      setSelected([]);
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setOpenDropdownId(null);
    try { await updateTask(taskId, { status: newStatus }); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    setOpenDropdownId(null);
    try { await updateTask(taskId, { priority: newPriority === "none" ? null : newPriority }); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    setOpenDropdownId(null);
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try { await deleteTask(taskId); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const openDropdown = (e, taskId) => {
    e.stopPropagation();
    if (openDropdownId === taskId) { setOpenDropdownId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < dropdownHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    setDropdownPos({ top, right: window.innerWidth - rect.right });
    setOpenDropdownId(taskId);
  };

  const clearFilters = () => {
    setSearch(""); setStatus(""); setPriority(""); setCategory(""); setSort("due_date"); setPage(1); setSelected([]);
  };

  // ── Dropdown Portal ────────────────────────────────────────────────────────
  const DropdownMenu = ({ task }) => {
    const STATUS_OPTIONS = [
      { value: "todo",        label: "Todo",        icon: "radio_button_unchecked", color: "#6b7280" },
      { value: "in_progress", label: "In Progress", icon: "pending",                color: "#f59e0b" },
      { value: "done",        label: "Done",         icon: "check_circle",           color: "#22c55e" },
    ];
    const PRIORITY_OPTIONS = [
      { value: "high",   label: "High",   color: "#ef4444" },
      { value: "medium", label: "Medium", color: "#f97316" },
      { value: "low",    label: "Low",    color: "#22c55e" },
      { value: "none",   label: "None",   color: "#9ca3af" },
    ];
    return createPortal(
      <div ref={dropdownRef}
        className="fixed z-[999] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
        style={{ top: dropdownPos.top, right: dropdownPos.right, minWidth: "190px" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Status */}
        <div className="px-3 pt-2.5 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Status</p>
          {STATUS_OPTIONS.filter((s) => s.value !== task.status).map((s) => (
            <button key={s.value} onClick={() => handleStatusChange(task.id, s.value)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="material-icons" style={{ fontSize: "15px", color: s.color }}>{s.icon}</span>
              <span className="text-sm text-gray-700">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="border-t border-gray-100 px-3 pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Priority</p>
          {PRIORITY_OPTIONS.map((p) => {
            const isCurrent = (task.priority || "none") === p.value;
            return (
              <button key={p.value} onClick={() => handlePriorityChange(task.id, p.value)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm flex-1" style={{ color: isCurrent ? p.color : "#374151", fontWeight: isCurrent ? 600 : 400 }}>
                  {p.label}
                </span>
                {isCurrent && <span className="material-icons" style={{ fontSize: "14px", color: p.color }}>check</span>}
              </button>
            );
          })}
        </div>

        {/* Delete */}
        <div className="border-t border-gray-100 px-3 py-1.5">
          <button onClick={() => handleDeleteTask(task.id)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 transition text-left">
            <span className="material-icons" style={{ fontSize: "15px", color: "#ef4444" }}>delete_outline</span>
            <span className="text-sm text-red-500">Delete Task</span>
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // ── Pagination component ───────────────────────────────────────────────────
  const Pagination = ({ compact = false }) => (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${compact ? "" : "border-t border-gray-100"}`}>
      <p className="text-sm text-gray-500">
        Showing {tasks.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} tasks
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <span className="material-icons" style={{ fontSize: "16px" }}>chevron_left</span>
        </button>
        {compact ? (
          <span className="w-8 h-8 rounded-lg text-sm font-medium border flex items-center justify-center"
            style={{ backgroundColor: "#5b4fcf", color: "white", borderColor: "#5b4fcf" }}>{page}</span>
        ) : (
          <>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-medium border transition"
                style={{ backgroundColor: page === p ? "#5b4fcf" : "white", color: page === p ? "white" : "#6b7280", borderColor: page === p ? "#5b4fcf" : "#e5e7eb" }}>
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-gray-400 px-1">...</span>
                <button onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  {totalPages}
                </button>
              </>
            )}
          </>
        )}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <span className="material-icons" style={{ fontSize: "16px" }}>chevron_right</span>
        </button>
        {!compact && (
          <select className="ml-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 bg-white outline-none" disabled>
            <option>10 / page</option>
          </select>
        )}
      </div>
    </div>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full space-y-4 px-1 sm:px-6 py-4">

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3 animate-fadeInUp">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white w-full sm:w-64">
              <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>search</span>
              <input type="text" placeholder="Search by title or keyword..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
            </div>
            {[
              { value: status,   setter: setStatus,   options: [["", "All Status"], ["todo", "Todo"], ["in_progress", "In Progress"], ["done", "Done"]] },
              { value: priority, setter: setPriority, options: [["", "All Priority"], ["high", "High"], ["medium", "Medium"], ["low", "Low"]] },
              { value: category, setter: setCategory, options: [["", "All Categories"], ["work", "Work"], ["personal", "Personal"], ["school", "School"], ["fitness", "Fitness"], ["others", "Others"]] },
            ].map(({ value, setter, options }, i) => (
              <div key={i} className="relative">
                <select value={value} onChange={(e) => setter(e.target.value)}
                  className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm text-gray-600 bg-white outline-none cursor-pointer">
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <span className="material-icons absolute right-2 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: "16px" }}>keyboard_arrow_down</span>
              </div>
            ))}
            <div className="relative flex items-center gap-1 border border-gray-200 rounded-xl pl-3 pr-8 py-2 bg-white">
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="appearance-none text-sm text-gray-600 bg-transparent outline-none cursor-pointer">
                <option value="due_date">Due Date (Earliest)</option>
                <option value="due_date_desc">Due Date (Latest)</option>
                <option value="created_at">Created On</option>
                <option value="priority">Priority</option>
              </select>
              <span className="material-icons absolute right-2 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: "16px" }}>swap_vert</span>
            </div>
            <button onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
              Clear All
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 bg-purple-50 border border-purple-100 rounded-2xl">
            <span className="text-sm font-medium text-purple-700">
              {selected.length} task{selected.length > 1 ? "s" : ""} selected
            </span>
            <button onClick={() => bulkAction("done")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-green-50"
              style={{ borderColor: "#22c55e", color: "#22c55e" }}>
              <span className="material-icons" style={{ fontSize: "16px" }}>check_circle</span>
              Mark as Done
            </button>
            <button onClick={() => bulkAction("delete")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-red-50"
              style={{ borderColor: "#ef4444", color: "#ef4444" }}>
              <span className="material-icons" style={{ fontSize: "16px" }}>delete</span>
              Delete
            </button>
            <button onClick={() => setSelected([])} className="ml-auto text-sm font-medium hover:underline" style={{ color: "#5b4fcf" }}>
              Clear Selection
            </button>
          </div>
        )}

        {/* ── CARD VIEW — mobile + tablet + small desktop (below xl / 1280px) ── */}
        <div className="xl:hidden space-y-3 animate-fadeInUp">

          {/* Select All bar */}
          {tasks.length > 0 && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-2.5 flex items-center gap-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
              <span className="text-sm text-gray-600">
                {allSelected ? "Deselect all" : `Select all ${tasks.length} tasks`}
              </span>
              {someSelected && (
                <span className="ml-auto text-xs font-medium text-purple-600">
                  {selected.length} selected
                </span>
              )}
            </div>
          )}

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <span className="material-icons animate-spin text-purple-400" style={{ fontSize: "32px" }}>autorenew</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center">
              <span className="material-icons text-gray-200 mb-3" style={{ fontSize: "48px" }}>assignment</span>
              <p className="text-sm font-medium text-gray-400">No tasks found</p>
              <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or create a new task</p>
            </div>
          ) : tasks.map((task) => {
            const isSelected  = selected.includes(task.id);
            const catColor    = getCategoryColor(task.category);
            const priColor    = getPriorityColor(task.priority);
            const statusStyle = getStatusStyle(task.status);
            const daysLeft    = getDaysLeft(task.due_date, task.status);
            return (
              <div key={task.id}
                className={`bg-white rounded-2xl border p-4 transition ${isSelected ? "border-purple-300 bg-purple-50/30" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
                    className="w-4 h-4 mt-0.5 rounded accent-purple-600 cursor-pointer flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>}
                  </div>
                  <button onClick={(e) => openDropdown(e, task.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
                    <span className="material-icons" style={{ fontSize: "18px" }}>more_horiz</span>
                  </button>
                  {openDropdownId === task.id && <DropdownMenu task={task} />}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                    {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priColor.dot }} />
                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium border" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    <span className="material-icons" style={{ fontSize: "14px", color: daysLeft?.color || "#9ca3af" }}>calendar_today</span>
                    <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
                    {daysLeft && <span className="text-xs font-medium" style={{ color: daysLeft.color }}>· {daysLeft.label}</span>}
                  </div>
                )}
              </div>
            );
          })}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <Pagination compact />
          </div>
        </div>

        {/* ── TABLE VIEW — large desktop only (xl+) ── */}
        <div className="hidden xl:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeInUp">
          <div>
            {/* Header */}
            <div className="grid items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide gap-3"
              style={{ gridTemplateColumns: "40px minmax(200px,1fr) 120px 120px 160px 130px 40px" }}>
              <div>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
              </div>
              <div>Task</div>
              <div>Category</div>
              <div>Priority</div>
              <div className="flex items-center gap-1 cursor-pointer select-none hover:text-purple-600 transition-colors"
                onClick={() => setSort(sort === "due_date" ? "due_date_desc" : "due_date")}>
                Due Date
                <span className="material-icons" style={{ fontSize: "14px", color: (sort === "due_date" || sort === "due_date_desc") ? "#5b4fcf" : "#9ca3af" }}>
                  {sort === "due_date" ? "arrow_upward" : sort === "due_date_desc" ? "arrow_downward" : "unfold_more"}
                </span>
              </div>
              <div>Status</div>
              <div className="flex justify-center">
                <span className="material-icons text-gray-400" style={{ fontSize: "18px" }}>settings</span>
              </div>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-icons animate-spin text-purple-400" style={{ fontSize: "32px" }}>autorenew</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-icons text-gray-200 mb-3" style={{ fontSize: "48px" }}>assignment</span>
                <p className="text-sm font-medium text-gray-400">No tasks found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or create a new task</p>
              </div>
            ) : tasks.map((task) => {
              const isSelected  = selected.includes(task.id);
              const catColor    = getCategoryColor(task.category);
              const priColor    = getPriorityColor(task.priority);
              const statusStyle = getStatusStyle(task.status);
              const daysLeft    = getDaysLeft(task.due_date, task.status);
              return (
                <div key={task.id}
                  className={`grid items-center px-5 py-3.5 border-b border-gray-50 transition cursor-pointer gap-3 ${isSelected ? "bg-purple-50/50" : "hover:bg-gray-50"}`}
                  style={{ gridTemplateColumns: "40px minmax(200px,1fr) 120px 120px 160px 130px 40px" }}>
                  <div>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
                      className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>}
                  </div>
                  <div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                      {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit" style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priColor.dot }} />
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                    </span>
                  </div>
                  <div>
                    {task.due_date ? (
                      <>
                        <p className="text-sm text-gray-700">{formatDate(task.due_date)}</p>
                        {daysLeft && <p className="text-xs font-medium mt-0.5" style={{ color: daysLeft.color }}>{daysLeft.label}</p>}
                      </>
                    ) : <p className="text-sm text-gray-300">—</p>}
                  </div>
                  <div>
                    <span className="text-xs px-3 py-1 rounded-lg font-medium border" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <button onClick={(e) => openDropdown(e, task.id)}
                      className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                      <span className="material-icons" style={{ fontSize: "18px" }}>more_horiz</span>
                    </button>
                    {openDropdownId === task.id && <DropdownMenu task={task} />}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination />
        </div>

      </div>
    </div>
  );
}