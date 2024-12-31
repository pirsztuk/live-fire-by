import { API_BASE_URL } from './constants';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('jwt_token')

  if (!token) {
    throw new Error('No authentication token found')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)

  try {
    const fullUrl = `${API_BASE_URL}${url}`
    const response = await fetch(fullUrl, { ...options, headers })

    if (response.status === 403) {
      sessionStorage.removeItem('jwt_token')
      throw new Error('Authentication failed')
    }

    return response
  } catch (error) {
    console.error('Error in authenticatedFetch:', error)
    throw error
  }
}

