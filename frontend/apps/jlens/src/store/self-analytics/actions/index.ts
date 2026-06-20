import { axiosInstance } from '../../axios'

export const analyticsApi = {
  getDashboards: async () => {
    return axiosInstance.get('/analytics/dashboards')
  },
  getDashboardById: async (id: string) => {
    return axiosInstance.get(`/analytics/dashboards/${id}`)
  },
  createDashboard: async (payload: any) => {
    return axiosInstance.post('/analytics/dashboards', payload)
  },
  deleteDashboard: async (id: string) => {
    return axiosInstance.delete(`/analytics/dashboards/${id}`)
  },
}