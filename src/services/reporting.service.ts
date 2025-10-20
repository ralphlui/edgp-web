import { ApiService } from './base-api.service'
import { ENV } from '../config/env.config'

export interface ChatMessage {
  id: string
  type: 'user' | 'system'
  text: string
  timestamp: Date
}

export interface ChartData {
  id: string
  title: string
  description: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data?: Record<string, unknown>[]
  image?: string // Base64 image data from API
}

export interface ReportInsight {
  id: string
  metric: string
  value: string | number
  description: string
}

export interface ReportSummary {
  insights: ReportInsight[]
  totalRecords: number
  generatedAt: Date
}

export interface AnalyticsReport {
  id: string
  type: string
  timestamp: Date
  dataSource: string
  totalRecords: number
  charts?: ChartData[]
  data?: Record<string, unknown>[]
  summary?: ReportSummary
}

export interface ChatResponse {
  success: boolean
  message: string
  chart_image?: string // Base64 encoded chart image from API
  report?: AnalyticsReport
}

export interface ApiChatResponse {
  success: boolean
  message: string
  chart_image?: string
}

class ReportingService extends ApiService {
  constructor() {
    super()
    // Use environment variable for analytics API URL
    this.api.defaults.baseURL = ENV.ANALYTICS_API_URL
  }

  /**
   * Send chat message to AI analytics assistant
   */
  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      console.log(`Sending chat message: ${message}`)

      // Get the access token from localStorage
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('No access token found. Please login first.')
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }

      const payload = {
        prompt: message,
      }

      console.log('Making chat request with payload:', payload)
      console.log('Request config:', config)

      // Use POST request to /report endpoint (base URL already includes /analytics)
      const response = await this.post<ApiChatResponse>('/report', payload, config)
      console.log('Chat API response:', response.data)

      // Convert API response to our internal format
      const chatResponse: ChatResponse = {
        success: response.data.success,
        message: response.data.message,
        chart_image: response.data.chart_image,
      }

      // If there's a chart image, create a report with it
      if (response.data.chart_image) {
        chatResponse.report = {
          id: `report-${Date.now()}`,
          type: 'Analytics Report',
          timestamp: new Date(),
          dataSource: 'Analytics API',
          totalRecords: 1,
          charts: [
            {
              id: 'chart-1',
              title: 'Analytics Chart',
              description: 'Generated chart from analytics API',
              type: 'bar',
              image: response.data.chart_image, // Store base64 image
            },
          ],
          summary: {
            insights: [
              {
                id: 'insight-1',
                metric: 'Report Status',
                value: response.data.success ? 'Generated' : 'Failed',
                description: 'Chart generation status',
              },
            ],
            totalRecords: 1,
            generatedAt: new Date(),
          },
        }
      }

      return chatResponse
    } catch (error) {
      console.error('Error sending chat message:', error)

      // Return error response instead of mock data
      return {
        success: false,
        message: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection and try again.`,
      }
    }
  }

  /**
   * Download report in specified format
   */
  async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    try {
      console.log(`Downloading report ${reportId} in ${format} format`)

      // For now, we'll implement a basic download functionality
      // This can be extended when the backend provides a download endpoint

      // Create a simple text file with report info
      const reportData = `Analytics Report
Generated: ${new Date().toLocaleString()}
Report ID: ${reportId}
Format: ${format}

This is a placeholder for the actual report download functionality.
The backend can provide a specific download endpoint for reports.`

      const blob = new Blob([reportData], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analytics-report-${reportId}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      throw error
    }
  }

  /**
   * Get available report templates
   */
  async getReportTemplates(): Promise<Record<string, unknown>[]> {
    try {
      const token = localStorage.getItem('access_token')

      if (!token) {
        throw new Error('No access token found. Please login first.')
      }

      // This endpoint might not exist yet, so we'll return empty array for now
      // Future implementation when backend provides the endpoint:
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      // }
      // const response = await this.get<{ success: boolean; data: Record<string, unknown>[] }>('/analytics/templates', config)
      // return response.data.data

      return []
    } catch (error) {
      console.error('Error fetching report templates:', error)
      return []
    }
  }
}

export const reportingService = new ReportingService()
export default reportingService
