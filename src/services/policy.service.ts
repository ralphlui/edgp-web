import { API_ENDPOINTS } from '@/config/api.config'
import { ApiService } from './base-api.service'

export interface PolicyRule {
  ruleId: string
  ruleName: string
  appliesToField: string | string[] // Support both single field and multiple fields
  description: string | null
  parameters: Record<string, string | number | boolean>
}

export interface Policy {
  policyId: string
  policyName: string
  description: string
  domainName: string
  rules: PolicyRule[]
  createdBy: string
  lastUpdatedBy: string
  organizationId: string
  published: boolean
  createdAt?: string
  updatedAt?: string
  lastUpdated?: string
}

export interface CreatePolicyRequest {
  policyName: string
  domainName: string
  rules: {
    appliesToField: string | string[] // Support both single field and multiple fields
    ruleName: string
    parameters: Record<string, unknown>
  }[]
  description: string
  isPublished: boolean
  createdBy: string
  [key: string]: unknown
}

export interface CreatePolicyResponse {
  success: boolean
  message: string
  data: Policy
}

export interface PolicyListResponse {
  success: boolean
  message: string
  totalRecord: number
  data: Policy[]
}

class PolicyService extends ApiService {
  constructor() {
    super()
    // Override the base URL for policy service
    this.api.defaults.baseURL = API_ENDPOINTS.policyBase
  }

  async getPolicies(
    page: number = 1,
    size: number = 1000,
    isPublished: boolean = true,
  ): Promise<PolicyListResponse> {
    try {
      console.log(
        'Making policy API call to:',
        `${API_ENDPOINTS.policies.list}?page=${page}&size=${size}&isPublished=${isPublished}`,
      )
      const response = await this.get<PolicyListResponse>(
        `${API_ENDPOINTS.policies.list}?page=${page}&size=${size}&isPublished=${isPublished}`,
      )
      console.log('Policy API raw response:', response)
      console.log('Policy API response data:', response.data)
      return response.data
    } catch (error) {
      console.error('Policy API error:', error)
      throw error
    }
  }

  async createPolicy(policyData: CreatePolicyRequest): Promise<CreatePolicyResponse> {
    try {
      console.log('Creating policy with data:', policyData)
      const response = await this.post<CreatePolicyResponse>(
        API_ENDPOINTS.policies.create,
        policyData,
      )
      console.log('Create policy response:', response)
      return response.data
    } catch (error) {
      console.error('Create policy error:', error)
      throw error
    }
  }

  async updatePolicy(policyId: string, policy: Partial<Policy>): Promise<Policy> {
    const response = await this.put<Policy>(`${API_ENDPOINTS.policies.update}/${policyId}`, policy)
    return response.data
  }

  async deletePolicy(policyId: string): Promise<void> {
    await this.delete(`${API_ENDPOINTS.policies.delete}/${policyId}`)
  }
}

export const policyService = new PolicyService()
