import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

const Staff = () => {
  const { user, logout } = useAuth()
  const [services, setServices] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    serviceId: '',
    customTaskName: '',
    hours: '',
    useCustomTask: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [servicesRes, logsRes] = await Promise.all([
        api.get('/api/staff/menu'),
        api.get('/api/staff/logs/my'),
      ])
      setServices(servicesRes.data)
      setTodayLogs(logsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setMessage({ type: 'error', text: '載入資料失敗' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const payload = {
        date: formData.date,
        hours: parseFloat(formData.hours),
        service_id: formData.useCustomTask ? null : parseInt(formData.serviceId),
        custom_task_name: formData.useCustomTask ? formData.customTaskName : null,
      }

      await api.post('/api/staff/logs', payload)
      
      setMessage({ type: 'success', text: '工作記錄已成功提交！' })
      
      // Reset form
      setFormData({
        ...formData,
        serviceId: '',
        customTaskName: '',
        hours: '',
      })
      
      // Refresh logs
      const logsRes = await api.get('/api/staff/logs/my')
      setTodayLogs(logsRes.data)
    } catch (error) {
      const errorMsg = error.response?.data?.detail || '提交失敗，請重試'
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">員工工作記錄</h1>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            登出
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <p className="text-primary-800">
            歡迎，{user?.display_name || '員工'}！請記錄今日的工作內容。
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Work Log Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">新增工作記錄</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Field (Readonly - Today Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期
              </label>
              <input
                type="date"
                value={formData.date}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">只能記錄今日的工作</p>
            </div>

            {/* Task Type Toggle */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useCustomTask}
                  onChange={(e) =>
                    setFormData({ ...formData, useCustomTask: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  其他工作（非服務項目）
                </span>
              </label>
            </div>

            {/* Service Dropdown OR Custom Task Input */}
            {!formData.useCustomTask ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服務項目
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">請選擇服務項目</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.category})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工作內容
                </label>
                <input
                  type="text"
                  value={formData.customTaskName}
                  onChange={(e) =>
                    setFormData({ ...formData, customTaskName: e.target.value })
                  }
                  placeholder="例如：清潔、備料、訓練等"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Hours Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                工作時數
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="例如：2.5"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {submitting ? '提交中...' : '提交記錄'}
            </button>
          </form>
        </div>

        {/* Today's Logs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">今日記錄</h2>
          
          {todayLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">尚無今日記錄</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      工作內容
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      時數
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleTimeString('zh-TW', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.service_name || log.custom_task_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.hours} 小時
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Total Hours */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                <span className="text-sm font-medium text-gray-700">
                  今日總時數：
                  <span className="text-lg text-primary-600 ml-2">
                    {todayLogs.reduce((sum, log) => sum + log.hours, 0).toFixed(1)} 小時
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Staff
