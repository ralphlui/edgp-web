import { ApiService } from './base-api.service'

export interface UploadRequest {
  policyId: string
  domainName: string
}

export interface UploadedFileData {
  field_name: string
  description: string
  data_type: string
  length: number
  'example/notes': string | number
  id: string
  organization_id: string
  policy_id: string
  domain_name: string
  file_id: string
  uploaded_by: string
  uploaded_date: string
  is_processed: number
}

export interface FileUploadResponse {
  success: boolean
  message: string
  totalRecord: number
  data: UploadedFileData[]
}

class FileUploadService extends ApiService {
  async uploadFile(
    file: File,
    uploadRequest: UploadRequest,
  ): Promise<{ data: FileUploadResponse }> {
    try {
      // Get the auth token
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      console.log('=== FILE UPLOAD DEBUG ===')
      console.log('Token available:', !!token)
      console.log('Upload request:', uploadRequest)
      console.log('File:', {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Try XMLHttpRequest approach with explicit multipart handling
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        const formData = new FormData()

        // Append file exactly as Postman does
        formData.append('file', file, file.name)

        // Append JSON as Blob with application/json type
        const jsonBlob = new Blob([JSON.stringify(uploadRequest)], {
          type: 'application/json',
        })
        formData.append('UploadRequest', jsonBlob, 'request.json')

        // Debug what we're sending
        console.log('FormData being sent:')
        console.log('- file: File attached')
        console.log('- UploadRequest: JSON blob attached')
        console.log('- JSON content:', JSON.stringify(uploadRequest))

        xhr.open('POST', `${import.meta.env.VITE_MDM_API_URL}/data/upload`)

        // Set only the authorization header
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.onload = () => {
          console.log('Response status:', xhr.status)
          console.log('Response headers:', xhr.getAllResponseHeaders())

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              console.log('Upload success:', data)
              resolve({ data })
            } catch (error) {
              console.error('Failed to parse success response:', error)
              reject(new Error('Failed to parse success response'))
            }
          } else {
            // Try to parse error response as JSON first
            let errorMessage = `HTTP ${xhr.status}: ${xhr.statusText}`
            let errorData = null

            try {
              errorData = JSON.parse(xhr.responseText)
              console.log('Parsed error response:', errorData)

              // Use the API's error message if available
              if (errorData && errorData.message) {
                errorMessage = errorData.message
              }
            } catch (parseError) {
              console.warn('Could not parse error response as JSON:', parseError)
              // Fall back to raw response text
              errorMessage = xhr.responseText || errorMessage
            }

            console.error('Upload failed:', {
              status: xhr.status,
              statusText: xhr.statusText,
              response: xhr.responseText,
              parsedError: errorData,
            })

            // Create a structured error object with status code and parsed message
            const structuredError = new Error(errorMessage) as Error & {
              status: number
              statusText: string
              responseData: unknown
            }
            structuredError.status = xhr.status
            structuredError.statusText = xhr.statusText
            structuredError.responseData = errorData

            reject(structuredError)
          }
        }

        xhr.onerror = () => {
          console.error('Network error during upload')
          reject(new Error('Network error during upload'))
        }

        xhr.ontimeout = () => {
          console.error('Upload timeout')
          reject(new Error('Upload timeout'))
        }

        console.log('Sending request to:', `${import.meta.env.VITE_MDM_API_URL}/data/upload`)
        xhr.send(formData)
      })
    } catch (error) {
      console.error('File upload error:', error)
      throw error
    }
  }
}

export const fileUploadService = new FileUploadService()
