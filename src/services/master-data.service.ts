import { API_ENDPOINTS } from '@/config/api.config'
import { ApiService } from './base-api.service'

export interface MasterDataItem {
  id: number
  file_id: string
  organization_id: string
  created_date: string
  updated_date: string
  is_archived: boolean
  domain_name: string
  workflow_tracker_id: string
  [key: string]: string | number | boolean // Dynamic fields based on domain type
}

export interface MasterDataResponse {
  success: boolean
  message: string
  totalRecord: number
  data: MasterDataItem[]
}

export type DomainType = 'customer' | 'location' | 'vendor' | 'product'

class MasterDataService extends ApiService {
  constructor() {
    super()
    // Set the base URL for workflow API - same pattern as workflow.service.ts
    this.api.defaults.baseURL = API_ENDPOINTS.workflowBase
  }

  /**
   * Get domain data by domain name - same pattern as workflow service
   */
  async getDomainData(domainName: DomainType): Promise<MasterDataResponse> {
    try {
      console.log(`Fetching master data for domain: ${domainName}`)

      // Use same pattern as workflow service - config with headers and params
      const config = {
        headers: {
          'X-FileId': '', // Empty X-FileId header as required by API
        },
        params: {
          domainName: domainName,
        },
      }

      console.log('Making request with config:', config)
      const response = await this.get<MasterDataResponse>('/wfm/domainData', config)
      console.log('Master data response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching master data:', error)
      throw error
    }
  }

  /**
   * Get available domain types
   */
  getDomainTypes(): { label: string; value: DomainType }[] {
    return [
      { label: 'Customer', value: 'customer' },
      { label: 'Location', value: 'location' },
      { label: 'Vendor', value: 'vendor' },
      { label: 'Product', value: 'product' },
    ]
  }

  /**
   * Format dynamic fields for display
   */
  getDisplayColumns(
    items: MasterDataItem[],
  ): Array<{ title: string; dataIndex: string; key: string }> {
    if (!items || items.length === 0) return []

    const sampleItem = items[0]
    const excludeFields = ['id', 'file_id', 'organization_id', 'workflow_tracker_id', 'is_archived']

    const columns = Object.keys(sampleItem)
      .filter((key) => !excludeFields.includes(key))
      .map((key) => ({
        title: this.formatColumnTitle(key),
        dataIndex: key,
        key: key,
      }))

    return columns
  }

  /**
   * Format column title for display
   */
  private formatColumnTitle(key: string): string {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

export const masterDataService = new MasterDataService()
export default masterDataService
