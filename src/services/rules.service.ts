import axios, { type AxiosInstance } from 'axios'

export interface RuleApiResponse {
  rule_name: string
  column_name: string | null
  value: unknown
}

export interface Rule {
  ruleId: string
  ruleName: string
  columnName: string | null
  value: unknown
  description?: string
}

class RulesService {
  private api: AxiosInstance

  constructor() {
    // Use environment variable for rules API URL - consistent with other services
    const rulesApiUrl = import.meta.env.VITE_RULES_API_URL || 'http://localhost:8008/api'
    console.log('Rules API URL from env:', rulesApiUrl)

    // Create a separate axios instance for rules API (no auth required)
    this.api = axios.create({
      baseURL: rulesApiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  }

  async getRules(): Promise<Rule[]> {
    try {
      const baseUrl = this.api.defaults.baseURL
      console.log('Making rules API call to:', `${baseUrl}/rules`)
      const response = await this.api.get<RuleApiResponse[]>('/rules')
      console.log('Rules API raw response:', response)
      console.log('Rules API response data:', response.data)
      console.log('Rules API response data type:', typeof response.data)
      console.log(
        'Rules API response data length:',
        Array.isArray(response.data) ? response.data.length : 'Not an array',
      )

      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('Rules API response is not an array:', response.data)
        throw new Error('Invalid response format: expected array')
      }

      // Transform API response to internal format
      const transformedRules: Rule[] = response.data.map((rule, index) => ({
        ruleId: `rule_${index + 1}`,
        ruleName: rule.rule_name,
        columnName: rule.column_name,
        value: rule.value,
        description: `Rule: ${rule.rule_name}`,
      }))

      console.log('Transformed rules:', transformedRules)
      console.log('Number of transformed rules:', transformedRules.length)
      return transformedRules
    } catch (error) {
      console.error('Rules API error:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        })
      }
      throw error
    }
  }
}

export const rulesService = new RulesService()
