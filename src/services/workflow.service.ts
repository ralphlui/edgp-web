import { API_ENDPOINTS } from '@/config/api.config'
import { ApiService } from './base-api.service'

export interface FailedValidation {
  error_message: string
  rule_name: string
  column_name: string
  status: string
}

export interface WorkflowDataRecord {
  id: string
  fileName: string
  domain_name: string
  uploaded_by: string
  organization_id: string
  file_id: string
  policy_id: string
  created_date: string
  rule_status: string
  final_status: string
  failed_validations?: FailedValidation[]
  [key: string]: unknown // For dynamic fields - more type-safe than 'any'
}

export interface WorkflowResponse {
  success: boolean
  message: string
  totalRecord: number
  data: {
    dataRecords: WorkflowDataRecord[]
    failedRecords: number
    successRecords: number
  }
}

class WorkflowService extends ApiService {
  constructor() {
    super()
    // Set the base URL for workflow API
    this.api.defaults.baseURL = API_ENDPOINTS.workflowBase
  }

  async getWorkflowData(fileId: string): Promise<WorkflowResponse> {
    try {
      console.log(`Fetching workflow data for file ID: ${fileId}`)

      // Set the X-FileId header for this request
      const config = {
        headers: {
          'X-FileId': fileId,
        },
      }

      console.log('Making request with config:', config)
      const response = await this.get<WorkflowResponse>(API_ENDPOINTS.workflow.list, config)
      console.log('Workflow data response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching workflow data:', error)
      throw error
    }
  }
}

export const workflowService = new WorkflowService()
