import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getTasks, bulkAction as bulkActionService, updateTask, deleteTask } from '@/services/taskService'
import useTaskStore from '@/store/taskStore'
import { PER_PAGE } from '@/constants/taskOptions'

// Cache key for MyTasks is the full set of server-side params.
const tasksKey = (p) => JSON.stringify(p)

// Returns the cached result iff it matches the current params AND no task has
// mutated since (taskVersion). Read imperatively so it never triggers a refetch.
const readTasksCache = (params) => {
  const { tasksCache, taskVersion } = useTaskStore.getState()
  return tasksCache &&
    tasksCache.key === tasksKey(params) &&
    tasksCache.version === taskVersion
    ? tasksCache
    : null
}

export default function useTasks() {
  const taskVersion          = useTaskStore((s) => s.taskVersion)
  const clearDashboardStats  = useTaskStore((s) => s.clearDashboardStats)
  const incrementTaskVersion = useTaskStore((s) => s.incrementTaskVersion)
  const setTasksCache        = useTaskStore((s) => s.setTasksCache)

  const location = useLocation()

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('search') || ''
  })
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')
  const [category, setCategory] = useState('')
  const [sort,     setSort]     = useState('due_date')
  const [page,     setPage]     = useState(1)

  // ── Data ─────────────────────────────────────────────────────────────────────
  // Seed from cache on mount — revisiting with the same params and no task
  // changes since shows the list instantly, no loading state.
  const seeded = readTasksCache({ search, status, priority, category, sort, page })
  const [tasks,   setTasks]   = useState(seeded?.tasks ?? [])
  const [total,   setTotal]   = useState(seeded?.total ?? 0)
  const [loading, setLoading] = useState(!seeded)

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState([])

  // ── Dropdown ──────────────────────────────────────────────────────────────────
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [dropdownPos,    setDropdownPos]    = useState({ top: 0, right: 0 })
  const dropdownRef = useRef(null)

  // ── Filter / Sort popovers ────────────────────────────────────────────────────
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen,   setSortOpen]   = useState(false)
  const [filterPos,  setFilterPos]  = useState({ top: 0, left: 0 })
  const [sortPos,    setSortPos]    = useState({ top: 0, left: 0 })
  const filterRef    = useRef(null)
  const sortRef      = useRef(null)
  const filterBtnRef = useRef(null)
  const sortBtnRef   = useRef(null)

  // ── Click outside / scroll close ─────────────────────────────────────────────
  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdownId(null)
      if (filterRef.current && !filterRef.current.contains(e.target) &&
          filterBtnRef.current && !filterBtnRef.current.contains(e.target))
        setFilterOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target) &&
          sortBtnRef.current && !sortBtnRef.current.contains(e.target))
        setSortOpen(false)
    }
    const closeOnScroll = () => setOpenDropdownId(null)
    document.addEventListener('mousedown', close)
    document.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [])

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    const key = { search, status, priority, category, sort, page }

    // Cache hit — same params, no task mutation since: reuse, skip the network.
    const cached = readTasksCache(key)
    if (cached) {
      setTasks(cached.tasks)
      setTotal(cached.total)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const params = { page, limit: PER_PAGE }
      if (search)   params.search   = search
      if (status)   params.status   = status
      if (priority) params.priority = priority
      if (category) params.category = category
      if (sort)     params.sort     = sort
      const res = await getTasks(params)
      const list = res.data.tasks || []
      const tot  = res.data.total || res.data.tasks?.length || 0
      setTasks(list)
      setTotal(tot)
      setTasksCache({
        key: tasksKey(key),
        version: useTaskStore.getState().taskVersion,
        tasks: list,
        total: tot,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, status, priority, category, sort, page, taskVersion, setTasksCache])

  useEffect(() => { fetchTasks() }, [fetchTasks])
  useEffect(() => { setPage(1); setSelected([]) }, [search, status, priority, category, sort])

  // Sync search from URL when navbar search navigates to /tasks
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlSearch = params.get('search') || ''
    setSearch(urlSearch)
  }, [location.search])

  // ── Selection helpers ─────────────────────────────────────────────────────────
  const allSelected  = tasks.length > 0 && selected.length === tasks.length
  const someSelected = selected.length > 0
  const totalPages   = Math.ceil(total / PER_PAGE)
  const toggleAll    = () => setSelected(allSelected ? [] : tasks.map((t) => t.id))
  const toggleOne    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])

  // ── Bulk actions ──────────────────────────────────────────────────────────────
  // Mutations bump taskVersion: it invalidates this cache (so the effect
  // refetches once) and the board / dashboard caches too — keeping every view
  // in sync instead of refetching the table directly.
  const bulkAction = async (action, extra = {}) => {
    try {
      await bulkActionService(selected, action, extra)
      clearDashboardStats()
      setSelected([])
      incrementTaskVersion()
    } catch (err) { console.error(err) }
  }

  // ── Per-task actions ──────────────────────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    setOpenDropdownId(null)
    try { await updateTask(taskId, { status: newStatus }); clearDashboardStats(); incrementTaskVersion() }
    catch (err) { console.error(err) }
  }

  const handlePriorityChange = async (taskId, newPriority) => {
    setOpenDropdownId(null)
    try {
      await updateTask(taskId, { priority: newPriority === 'none' ? null : newPriority })
      clearDashboardStats()
      incrementTaskVersion()
    } catch (err) { console.error(err) }
  }

  const handleDeleteTask = async (taskId) => {
    setOpenDropdownId(null)
    if (!window.confirm('Delete this task? This cannot be undone.')) return
    try { await deleteTask(taskId); clearDashboardStats(); incrementTaskVersion() }
    catch (err) { console.error(err) }
  }

  // ── Dropdown positioning ──────────────────────────────────────────────────────
  const openDropdown = (e, taskId) => {
    e.stopPropagation()
    if (openDropdownId === taskId) { setOpenDropdownId(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    const dropdownHeight = 300
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < dropdownHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4
    setDropdownPos({ top, right: window.innerWidth - rect.right })
    setOpenDropdownId(taskId)
  }

  // ── Popover positioning ───────────────────────────────────────────────────────
  const calcPopoverPos = (btnRef, popoverWidth) => {
    const rect = btnRef.current.getBoundingClientRect()
    const spaceRight  = window.innerWidth - rect.left
    const spaceBottom = window.innerHeight - rect.bottom
    const left = spaceRight < popoverWidth ? rect.right - popoverWidth : rect.left
    const top  = spaceBottom < 300 ? rect.top - 12 : rect.bottom + 8
    return { top, left }
  }

  // ── Clear all filters ─────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearch(''); setStatus(''); setPriority(''); setCategory('')
    setSort('due_date'); setPage(1); setSelected([])
  }

  return {
    // Data
    tasks, loading, total, totalPages,
    // Filters
    search, setSearch, status, setStatus,
    priority, setPriority, category, setCategory,
    sort, setSort, page, setPage, clearFilters,
    // Selection
    selected, setSelected, allSelected, someSelected, toggleAll, toggleOne,
    // Actions
    bulkAction, handleStatusChange, handlePriorityChange, handleDeleteTask,
    // Dropdown
    openDropdownId, setOpenDropdownId, dropdownPos, dropdownRef, openDropdown,
    // Popovers
    filterOpen, setFilterOpen, sortOpen, setSortOpen,
    filterPos, setFilterPos, sortPos, setSortPos,
    filterRef, sortRef, filterBtnRef, sortBtnRef, calcPopoverPos,
  }
}