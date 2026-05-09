import { useState, useEffect, useRef } from 'react'
import useTaskStore from '../store/taskStore'
import { createTask } from '../services/taskService'

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'high',
  category: '',
  due_date: '',
  due_time: '',
  addAnother: false,
}

export default function NewTaskModal() {
  const { isNewTaskModalOpen, closeNewTaskModal, incrementTaskVersion, clearDashboardStats } =
    useTaskStore()

  const [form, setForm] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const titleRef = useRef(null)

  useEffect(() => {
    if (isNewTaskModalOpen) {
      setForm(INITIAL_FORM)
      setError('')
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [isNewTaskModalOpen])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeNewTaskModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeNewTaskModal])

  if (!isNewTaskModalOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Task title is required.')
      titleRef.current?.focus()
      return
    }
    setLoading(true)
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority === 'none' ? null : form.priority,
        category: form.category || 'others',
        due_date: form.due_date || null,
        due_time: form.due_time || null,
      })
      incrementTaskVersion()
      clearDashboardStats()
      if (form.addAnother) {
        setForm(INITIAL_FORM)
        setTimeout(() => titleRef.current?.focus(), 50)
      } else {
        closeNewTaskModal()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const priorityOptions = [
    { value: 'high', label: 'High', color: '#5b4fcf' },
    { value: 'medium', label: 'Medium', color: '#f97316' },
    { value: 'low', label: 'Low', color: '#22c55e' },
    { value: 'none', label: 'None', color: '#9ca3af' },
  ]

  const categoryOptions = [
    { value: 'work', label: '💼 Work' },
    { value: 'personal', label: '🙋 Personal' },
    { value: 'school', label: '📚 School' },
    { value: 'fitness', label: '💪 Fitness' },
    { value: 'others', label: '📌 Others' },
  ]

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition bg-white"
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(15,15,35,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && closeNewTaskModal()}
    >
      <div
        className="w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif', maxHeight: '92vh', maxWidth: '780px' }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Task</h2>
            <p className="text-sm text-gray-400 mt-0.5">Create a task and stay organized.</p>
          </div>
          <button
            onClick={closeNewTaskModal}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100 mt-0.5"
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-100">

              {/* ── Left Column ── */}
              <div className="px-6 py-5 space-y-5">

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '16px' }}>error_outline</span>
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className={labelCls}>
                    Task Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={titleRef}
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Design landing page for marketing site"
                    className={inputCls}
                  />
                </div>

                {/* Description with toolbar */}
                <div>
                  <label className={labelCls}>Description</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Add more details about this task..."
                      rows={4}
                      className="w-full px-3.5 pt-2.5 pb-1 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none bg-white"
                    />

                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={labelCls}>Priority</label>
                  <div className="flex items-center gap-5 flex-wrap">
                    {priorityOptions.map((p) => {
                      const isSelected = form.priority === p.value
                      return (
                        <label
                          key={p.value}
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition"
                            style={{
                              borderColor: isSelected ? p.color : '#d1d5db',
                              backgroundColor: isSelected ? p.color : 'white',
                            }}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: isSelected ? p.color : '#6b7280' }}
                          >
                            {p.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>sell</span>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full appearance-none border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition cursor-pointer"
                    >
                      <option value="">Select a category</option>
                      {categoryOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Due Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>calendar_today</span>
                      <input
                        type="date"
                        name="due_date"
                        value={form.due_date}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>schedule</span>
                      <input
                        type="time"
                        name="due_time"
                        value={form.due_time}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right Column ── */}
              <div className="px-6 py-5 space-y-5">

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>flag</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full appearance-none border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition cursor-pointer"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Assignee — coming soon */}
                <div>
                  <label className={labelCls}>Assignee</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed">
                    <span className="material-icons" style={{ fontSize: '16px' }}>person_outline</span>
                    <span>Assign to someone</span>
                    <span className="ml-auto material-icons" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-1">Available in Team features</p>
                </div>

                {/* Tags — coming soon */}
                <div>
                  <label className={labelCls}>Tags</label>
                  <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 cursor-not-allowed">
                    <p className="text-sm text-gray-400">Add tags (e.g., UI, Design)</p>
                    <p className="text-xs text-gray-300 mt-0.5">Press Enter to add multiple tags</p>
                  </div>
                </div>

                {/* Repeat — coming soon */}
                <div>
                  <label className={labelCls}>Repeat</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed">
                    <span className="material-icons" style={{ fontSize: '16px' }}>repeat</span>
                    <span>Does not repeat</span>
                    <span className="ml-auto material-icons" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Reminders — coming soon */}
                <div>
                  <label className={labelCls}>Reminders</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed">
                    <span className="material-icons" style={{ fontSize: '16px' }}>notifications_none</span>
                    <span>Add reminder</span>
                    <span className="ml-auto material-icons" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: '#f5f3ff', border: '1px solid #ede9fe' }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: '#ede9fe' }}
                  >
                    <span className="material-icons" style={{ fontSize: '15px', color: '#5b4fcf' }}>tips_and_updates</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#5b4fcf' }}>Pro Tip</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Break down large tasks into subtasks for better management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="addAnother"
              checked={form.addAnother}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Add another task</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeNewTaskModal}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              {loading ? (
                <>
                  <span className="material-icons animate-spin" style={{ fontSize: '16px' }}>refresh</span>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}