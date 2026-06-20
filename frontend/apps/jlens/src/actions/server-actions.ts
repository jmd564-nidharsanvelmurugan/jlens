import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true  // Enable cookies - auth via HTTP-only cookies
})

const UnknownError = "Unknown Error";

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {

		if (error.response) {
			if (error.response.status === 401) {
				sessionStorage.clear()
				window.location.href = "/login"
			}
            return Promise.reject({
				error: error.response.data || error.message || UnknownError,
			})
		}

		return Promise.reject({ error: error.message || "Network Error" })
	}
)

// No need to add Authorization header - using HTTP-only cookies

export const login = async (email: string, password: string) => {
	// 
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const loginWithMicrosoft = async ({
  name,
  email,
  id,
}: {
  name: string
  email: string
  id: string
}) => {
  const response = await apiClient.post('/auth/microsoft-login', {
    name,
    email,
    id,
  })
  return response.data
}

export const checkUserExists = async (email: string) => {
  const res = await apiClient.get(`/auth/user-exists?email=${encodeURIComponent(email)}`)
  
  
  return res.data
}

export const signup = async ({
  name,
  email,
  password,
  designation,
}: {
  name: string
  email: string
  password: string
  designation?: string
}) => {
  const response = await apiClient.post('/auth/signup', {
    name,
    email,
    password,
    designation,
  })
  return response.data
}

export const signupWithMicrosoft = async ({
  name,
  email,
  id,
}: {
  name: string
  email: string
  id: string
}) => {
  const response = await apiClient.post('/auth/signup-microsoft', {
    name,
    email,
    id,
    client_name: 'jlens',
  })
  return response.data
}

export const getAvailableModels = async () => {
  try {
    const response = await apiClient.get('/user-access/models-workspaces');
    return response.data.models;
  } catch (error) {
    throw error;
  }
};
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};
