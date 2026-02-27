import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyProfile, fetchMyTransactions } from '../api/member'
import { User, Crown, Star, Calendar, DollarSign, ShoppingBag, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const TIER_CONFIG = {
  regular: {
    label: '一般會員',
    color: 'from-gray-400 to-gray-500',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Star,
    description: '感謝您成為嫚霏的會員！持續消費即可升級為 VIP 會員，享受更多專屬優惠。',
  },
  vip: {
    label: 'VIP 會員',
    color: 'from-amber-400 to-yellow-500',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Crown,
    description: '尊榮 VIP 會員！您可享有專屬優惠折扣、優先預約及生日驚喜禮遇。',
  },
}

const MemberProfile = () => {
  const { user } = useAuth()

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery({
    queryKey: ['my-profile'],
    queryFn: fetchMyProfile,
    enabled: !!user,
  })

  const {
    data: transactions = [],
    isLoading: txnLoading,
    isError: txnError,
  } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => fetchMyTransactions(),
    enabled: !!user,
  })

  const isLoading = profileLoading || txnLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-primary-500 mx-auto" />
          <p className="mt-4 text-gray-500">載入會員資料...</p>
        </div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">無法載入資料</h2>
          <p className="text-gray-500 mb-6">請確認您已登入，或稍後再試</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  const tier = TIER_CONFIG[profile?.tier] || TIER_CONFIG.regular
  const TierIcon = tier.icon
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <>
      <Helmet>
        <title>會員中心 | 嫚霏 SPA</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className={`bg-gradient-to-r ${tier.color} py-16 px-4`}>
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TierIcon size={36} />
            </div>
            <h1 className="text-3xl font-serif font-bold tracking-wide mb-2">
              {profile?.display_name || '會員'}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border ${tier.badgeClass} bg-white/90`}>
              <TierIcon size={14} />
              {tier.label}
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 -mt-8 pb-16 space-y-6">
          {/* Tier Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tier.color} flex items-center justify-center text-white shrink-0`}>
                <TierIcon size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{tier.label}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{tier.description}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <DollarSign size={24} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                ${totalSpent.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">累計消費</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <ShoppingBag size={24} className="mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-xs text-gray-500 mt-1">消費次數</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-gray-400" />
              個人資料
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">姓名</span>
                <span className="text-sm font-medium text-gray-900">{profile?.display_name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">會員等級</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${tier.badgeClass}`}>
                  <TierIcon size={12} />
                  {tier.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">LINE ID</span>
                <span className="text-sm font-medium text-gray-900 font-mono">
                  {profile?.line_user_id ? `${profile.line_user_id.slice(0, 8)}...` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">加入日期</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              消費紀錄
            </h3>

            {txnError ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2" />
                <p className="text-sm">無法載入消費紀錄</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingBag size={32} className="mx-auto mb-2" />
                <p className="text-sm">目前還沒有消費紀錄</p>
                <p className="text-xs mt-1">歡迎預約我們的療程體驗！</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-gray-50">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{txn.service_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(txn.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${txn.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="text-center pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors"
            >
              <ArrowLeft size={16} />
              返回首頁
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default MemberProfile
