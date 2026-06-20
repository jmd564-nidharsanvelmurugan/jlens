import { axiosInstance } from '../../axios'

export interface WorkspacePayload {
  name: string
  description: string
  preprompt?: string
  is_private: boolean
}

export const getWorkspaces = async () => {
  const res = await axiosInstance.get('/user-access/models-workspaces')
  
  // Return only system workspaces from models-workspaces endpoint
  return res.data.workspaces || []
}

export const createWorkspace = async (payload: WorkspacePayload) => {
  const res = await axiosInstance.post('/workspaces/', payload)
  return res.data
}

export const getSharedWorkspaces = async (workspaceId: string) => {
  const res = await axiosInstance.get(`/workspaces/${workspaceId}/`)
  return res.data
}

export const deleteWorkspace = async (workspaceId: string) => {
  await axiosInstance.delete(`/workspaces/${workspaceId}/`)
  return workspaceId
}

export const workspaceFilesList = async (workspaceId: string, workspaceName?: string) => {
  // Use special endpoint for JMAN Sales workspace
  if (workspaceName === "Jman Sales") {
    const res = await axiosInstance.get('/workspaces/jman-sales/files/')
    return res.data
  }
  
  const res = await axiosInstance.get(`/workspaces/${workspaceId}/files/`)
  return res.data
}

export const uploadWorkspaceFiles = async ({
  workspaceId,
  files
}: {
  workspaceId: string
  files: FileList
}): Promise<any> => {
  const formData = new FormData()
  formData.append("workspaceId", workspaceId)

  Array.from(files).forEach((file) => {
    formData.append("files", file)
  })

  const response = await axiosInstance.post(`/workspaces/upload-file-progressive/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })

  return response.data
}

export const updateWorkspace = async (workspaceId: string, updatedData?: string ) => {
  
  
  await axiosInstance.put(
    `/workspaces/${workspaceId}/pre-prompt/`,
    { pre_prompt: updatedData },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  
  
  return { workspaceId, updatedData };
};

export const listJmanSalesFiles = async () => {
  const res = await axiosInstance.get('/workspaces/jman-sales/files/')
  return res.data
}

export const generateSasUrl = async (containerName: string, blobName: string) => {
  const res = await axiosInstance.get('/workspaces/generate-sas-url/', {
    params: {
      container_name: containerName,
      blob_name: blobName
    }
  })
  return res.data
}

export const getWorkspaceStorage = async (workspaceId: string) => {
  const res = await axiosInstance.get(`/workspaces/${workspaceId}/storage/`)
  return res.data
}

export const getFileIndexingStatus = async (workspaceId: string, fileId: string) => {
  const res = await axiosInstance.get(`/workspaces/${workspaceId}/files/${fileId}/indexing-status/`)
  return res.data
}