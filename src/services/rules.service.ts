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

export interface AiRuleSuggestion {
  rule_name: string
  column_name: string
  value: {
    min_value?: number
    max_value?: number
    value?: number | string | string[]
  } | null
}

export interface AiRuleSuggestionsResponse {
  rule_suggestions: AiRuleSuggestion[]
}

class RulesService {
  private api: AxiosInstance
  private aiApi: AxiosInstance

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

    // Create axios instance for AI policy suggestions API
    const aiApiUrl =
      import.meta.env.VITE_AI_POLICY_SUGGESTIONS_API_URL || 'http://localhost:8092/api/aips'
    console.log('AI Policy Suggestions API URL from env:', aiApiUrl)

    this.aiApi = axios.create({
      baseURL: aiApiUrl,
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

  /**
   * Get AI-powered rule suggestions for a specific domain
   */
  async getAiRuleSuggestions(domain: string): Promise<AiRuleSuggestion[]> {
    try {
      const domainLower = domain.toLowerCase()
      const baseUrl = this.aiApi.defaults.baseURL
      console.log('Making AI suggestions API call to:', `${baseUrl}/rules/suggest`)
      console.log('Request payload:', { domain: domainLower })

      // Get the access token from localStorage
      const token = localStorage.getItem('access_token')

      if (!token) {
        console.warn('No access token found for AI suggestions API')
        return []
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }

      const response = await this.aiApi.post<AiRuleSuggestionsResponse>(
        '/rules/suggest',
        {
          domain: domainLower,
        },
        config,
      )

      console.log('AI suggestions API response:', response.data)

      if (!response.data.rule_suggestions || !Array.isArray(response.data.rule_suggestions)) {
        console.error('Invalid AI suggestions response format:', response.data)
        return []
      }

      return response.data.rule_suggestions
    } catch (error) {
      console.error('AI suggestions API error:', error)
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        })
      }
      // Return empty array instead of throwing to avoid breaking the form
      return []
    }
  }
}

export const rulesService = new RulesService()
