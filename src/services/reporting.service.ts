import { API_ENDPOINTS } from '@/config/api.config'
import { ApiService } from './base-api.service'

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
  report?: AnalyticsReport
}

class ReportingService extends ApiService {
  constructor() {
    super()
    // Set the base URL for workflow API - same pattern as other services
    this.api.defaults.baseURL = API_ENDPOINTS.workflowBase
  }

  /**
   * Send chat message to AI analytics assistant
   */
  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      console.log(`Sending chat message: ${message}`)

      const config = {
        headers: {
          'X-FileId': '', // Empty X-FileId header as required by API
        },
      }

      const payload = {
        message: message,
        timestamp: new Date().toISOString(),
      }

      console.log('Making chat request with payload:', payload)
      const response = await this.post<ChatResponse>('/analytics/chat', payload, config)
      console.log('Chat response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error sending chat message:', error)

      // Return a mock response for development
      return this.getMockChatResponse(message)
    }
  }

  /**
   * Download report in specified format
   */
  async downloadReport(reportId: string, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<void> {
    try {
      console.log(`Downloading report ${reportId} in ${format} format`)

      const config = {
        headers: {
          'X-FileId': '',
        },
        params: {
          reportId: reportId,
          format: format,
        },
        responseType: 'blob' as const,
      }

      const response = await this.get<Blob>('/analytics/download', config)

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.${format}`)
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
      const config = {
        headers: {
          'X-FileId': '',
        },
      }

      const response = await this.get<{ success: boolean; data: Record<string, unknown>[] }>(
        '/analytics/templates',
        config,
      )
      return response.data.data
    } catch (error) {
      console.error('Error fetching report templates:', error)
      throw error
    }
  }

  /**
   * Mock response for development - remove when backend is ready
   */
  private getMockChatResponse(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase()

    // Simulate different types of responses based on message content
    if (lowerMessage.includes('customer') || lowerMessage.includes('trend')) {
      return {
        success: true,
        message:
          "I've analyzed your customer data and generated a comprehensive report showing trends over the last 6 months.",
        report: {
          id: `report-${Date.now()}`,
          type: 'Customer Trends Analysis',
          timestamp: new Date(),
          dataSource: 'Customer Database',
          totalRecords: 1250,
          charts: [
            {
              id: 'chart-1',
              title: 'Customer Growth Over Time',
              description: 'Monthly customer acquisition trends',
              type: 'line',
              data: [],
            },
            {
              id: 'chart-2',
              title: 'Customer Distribution by Region',
              description: 'Geographic distribution of customers',
              type: 'pie',
              data: [],
            },
          ],
          data: [
            { month: 'January', new_customers: 45, total_customers: 1100, growth_rate: '4.3%' },
            { month: 'February', new_customers: 52, total_customers: 1152, growth_rate: '4.7%' },
            { month: 'March', new_customers: 38, total_customers: 1190, growth_rate: '3.3%' },
            { month: 'April', new_customers: 41, total_customers: 1231, growth_rate: '3.4%' },
            { month: 'May', new_customers: 19, total_customers: 1250, growth_rate: '1.5%' },
          ],
          summary: {
            insights: [
              {
                id: 'insight-1',
                metric: 'Total Customers',
                value: '1,250',
                description: 'Active customers in database',
              },
              {
                id: 'insight-2',
                metric: 'Growth Rate',
                value: '3.4%',
                description: 'Average monthly growth',
              },
              {
                id: 'insight-3',
                metric: 'New This Month',
                value: '19',
                description: 'Customers acquired in May',
              },
            ],
            totalRecords: 1250,
            generatedAt: new Date(),
          },
        },
      }
    } else if (lowerMessage.includes('product') || lowerMessage.includes('sales')) {
      return {
        success: true,
        message:
          "Here's your product performance analysis. I can see some interesting patterns in your sales data.",
        report: {
          id: `report-${Date.now()}`,
          type: 'Product Sales Analysis',
          timestamp: new Date(),
          dataSource: 'Product Database',
          totalRecords: 89,
          charts: [
            {
              id: 'chart-1',
              title: 'Top Performing Products',
              description: 'Products ranked by sales volume',
              type: 'bar',
              data: [],
            },
          ],
          data: [
            { product_name: 'Product A', sales_volume: 1250, revenue: '$45,000', margin: '35%' },
            { product_name: 'Product B', sales_volume: 980, revenue: '$38,500', margin: '42%' },
            { product_name: 'Product C', sales_volume: 750, revenue: '$28,200', margin: '38%' },
          ],
          summary: {
            insights: [
              {
                id: 'insight-1',
                metric: 'Total Products',
                value: '89',
                description: 'Active products in catalog',
              },
              {
                id: 'insight-2',
                metric: 'Best Seller',
                value: 'Product A',
                description: 'Highest sales volume',
              },
            ],
            totalRecords: 89,
            generatedAt: new Date(),
          },
        },
      }
    } else {
      return {
        success: true,
        message:
          "I understand you're looking for insights. Could you be more specific about what data you'd like me to analyze? For example, you could ask about customer trends, product performance, location data, or vendor analytics.",
      }
    }
  }
}

export const reportingService = new ReportingService()
