<template>
  <div class="reporting-analytics">
    <div class="page-header">
      <h2>Reporting & Analytics</h2>
      <p>Generate insights and reports through AI-powered analytics</p>
    </div>

    <!-- Chat Section -->
    <div class="chat-section">
      <div class="section-header">
        <h3>AI Analytics Assistant</h3>
        <p>Ask questions about your data and get instant insights</p>
      </div>

      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <div v-for="message in messages" :key="message.id" :class="['message', message.type]">
            <div class="message-content">
              <div class="message-text">{{ message.text }}</div>
              <div class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</div>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="message system">
            <div class="message-content">
              <div class="message-text"><a-spin size="small" /> Analyzing your request...</div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <a-input-search
            v-model:value="currentMessage"
            placeholder="Ask about your data... (e.g., 'Show me customer trends for this month')"
            enter-button="Send"
            size="large"
            :loading="isLoading"
            @search="sendMessage"
            @keyup.enter="sendMessage"
          />
        </div>
      </div>
    </div>

    <!-- Report Display Section -->
    <div class="report-section" v-if="currentReport">
      <div class="section-header">
        <h3>Generated Report</h3>
        <div class="report-actions">
          <a-button type="primary" @click="downloadReport" :loading="downloadLoading">
            <template #icon><DownloadOutlined /></template>
            Download
          </a-button>
          <a-button @click="clearReport">
            <template #icon><ClearOutlined /></template>
            Clear
          </a-button>
        </div>
      </div>

      <div class="report-container">
        <!-- Report Metadata -->
        <div class="report-meta">
          <a-descriptions :column="2" size="small" bordered>
            <a-descriptions-item label="Report Type">{{ currentReport.type }}</a-descriptions-item>
            <a-descriptions-item label="Generated">{{
              formatTimestamp(currentReport.timestamp)
            }}</a-descriptions-item>
            <a-descriptions-item label="Data Source">{{
              currentReport.dataSource
            }}</a-descriptions-item>
            <a-descriptions-item label="Records">{{
              currentReport.totalRecords
            }}</a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- Report Content -->
        <div class="report-content">
          <!-- Charts Section -->
          <div
            v-if="currentReport.charts && currentReport.charts.length > 0"
            class="charts-section"
          >
            <h4>Visual Analytics</h4>
            <div class="charts-grid">
              <div v-for="chart in currentReport.charts" :key="chart.id" class="chart-item">
                <div class="chart-title">{{ chart.title }}</div>
                <div class="chart-placeholder">
                  <!-- Display actual chart image if available -->
                  <div v-if="chart.image" class="chart-image">
                    <img
                      :src="`data:image/png;base64,${chart.image}`"
                      :alt="chart.title"
                      class="chart-img"
                    />
                  </div>
                  <!-- Fallback placeholder for chart component -->
                  <div v-else class="chart-content">
                    <p>{{ chart.description }}</p>
                    <small>Chart data: {{ chart.data?.length || 0 }} points</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Table Section -->
          <div v-if="currentReport.data && currentReport.data.length > 0" class="data-section">
            <h4>Report Data</h4>
            <a-table
              :dataSource="currentReport.data"
              :columns="reportColumns"
              :pagination="{ pageSize: 10, showSizeChanger: true }"
              :scroll="{ x: 800 }"
              size="small"
              bordered
            />
          </div>

          <!-- Summary Section -->
          <div v-if="currentReport.summary" class="summary-section">
            <h4>Key Insights</h4>
            <div class="insights-grid">
              <div
                v-for="insight in currentReport.summary.insights"
                :key="insight.id"
                class="insight-card"
              >
                <div class="insight-metric">{{ insight.metric }}</div>
                <div class="insight-value">{{ insight.value }}</div>
                <div class="insight-description">{{ insight.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-report">
      <a-empty description="No report generated yet">
        <template #image>
          <BarChartOutlined style="font-size: 48px; color: #d9d9d9" />
        </template>
        <p>Start a conversation with the AI assistant to generate your first report</p>
      </a-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { message } from 'ant-design-vue'
import { DownloadOutlined, ClearOutlined, BarChartOutlined } from '@ant-design/icons-vue'
import {
  reportingService,
  type ChatMessage,
  type AnalyticsReport,
} from '@/services/reporting.service'

// Reactive data
const messages = ref<ChatMessage[]>([
  {
    id: '1',
    type: 'system',
    text: "Hello! I'm your AI Analytics Assistant. I can help you generate reports and insights from your data. What would you like to analyze today?",
    timestamp: new Date(),
  },
])

const currentMessage = ref('')
const isLoading = ref(false)
const downloadLoading = ref(false)
const currentReport = ref<AnalyticsReport | null>(null)
const chatMessages = ref<HTMLElement>()

// Computed properties
const reportColumns = computed(() => {
  if (!currentReport.value?.data || currentReport.value.data.length === 0) {
    return []
  }

  const firstRow = currentReport.value.data[0]
  return Object.keys(firstRow).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    dataIndex: key,
    key: key,
    width: 150,
    ellipsis: true,
  }))
})

// Methods
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    text: currentMessage.value.trim(),
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  const messageText = currentMessage.value.trim()
  currentMessage.value = ''
  isLoading.value = true

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  try {
    // Send message to backend and get response
    const response = await reportingService.sendChatMessage(messageText)

    // Add system response
    const systemMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      text: response.message,
      timestamp: new Date(),
    }
    messages.value.push(systemMessage)

    // If response includes a report, set it
    if (response.report) {
      currentReport.value = response.report
      message.success('Report generated successfully!')
    }
  } catch (error) {
    console.error('Error sending message:', error)

    const errorMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'system',
      text: 'Sorry, I encountered an error while processing your request. Please try again.',
      timestamp: new Date(),
    }
    messages.value.push(errorMessage)

    message.error('Failed to send message')
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

const formatTimestamp = (timestamp: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(timestamp)
}

const downloadReport = async () => {
  if (!currentReport.value) return

  downloadLoading.value = true
  try {
    await reportingService.downloadReport(currentReport.value.id)
    message.success('Report downloaded successfully!')
  } catch (error) {
    console.error('Error downloading report:', error)
    message.error('Failed to download report')
  } finally {
    downloadLoading.value = false
  }
}

const clearReport = () => {
  currentReport.value = null
  message.info('Report cleared')
}
</script>

<style scoped>
.reporting-analytics {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h2 {
  margin: 0;
  color: #262626;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 8px 0 0 0;
  color: #8c8c8c;
  font-size: 16px;
}

.chat-section,
.report-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.section-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #262626;
  font-size: 18px;
  font-weight: 600;
}

.section-header p {
  margin: 4px 0 0 0;
  color: #8c8c8c;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.chat-container {
  padding: 24px;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.system {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  position: relative;
}

.message.user .message-content {
  background: #1890ff;
  color: white;
}

.message.system .message-content {
  background: white;
  border: 1px solid #e8e8e8;
  color: #262626;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-timestamp {
  font-size: 12px;
  opacity: 0.7;
}

.report-container {
  padding: 24px;
}

.report-meta {
  margin-bottom: 24px;
}

.report-content > div {
  margin-bottom: 32px;
}

.report-content h4 {
  margin: 0 0 16px 0;
  color: #262626;
  font-size: 16px;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.chart-item {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
}

.chart-title {
  padding: 12px 16px;
  background: #fafafa;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-content {
  text-align: center;
  color: #8c8c8c;
}

.chart-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.chart-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.insight-card {
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  text-align: center;
}

.insight-metric {
  font-size: 14px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.insight-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.insight-description {
  font-size: 12px;
  color: #595959;
  line-height: 1.4;
}

.empty-report {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 60px 24px;
  text-align: center;
}

.empty-report p {
  margin-top: 16px;
  color: #8c8c8c;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
