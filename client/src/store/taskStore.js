import { create } from 'zustand'
import api from '../api/axios'

const useTaskStore = create((set, get) => ({
  dashboardStats: null,
  dashboardLoading: false,

  fetchDashboardStats: async () => {
    if (get().dashboardStats) return // already loaded — skip fetch!

    set({ dashboardLoading: true })
    try {
      const res = await api.get('/tasks/dashboard/stats')
      set({ dashboardStats: res.data, dashboardLoading: false })
    } catch (error) {
      set({ dashboardLoading: false })
    }
  },

  clearDashboardStats: () => set({ dashboardStats: null })
}))

export default useTaskStore