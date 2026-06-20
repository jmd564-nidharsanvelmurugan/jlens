// src/api/user-access.ts

import { axiosInstance } from '../axios'

export const getUserAccess = async () => {
  const res = await axiosInstance.get('/user-access/me')
  return res.data
}
