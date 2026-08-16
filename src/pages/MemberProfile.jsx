import { useQuery } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyProfile, fetchMyTransactions, updateMyProfile } from '../api/member'
import { Loader2, AlertCircle, ArrowLeft, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getErrorMessage } from '../utils/errorMessage'
import { useFeedback } from '../components/ui/Feedback'
import Modal from '../components/ui/Modal'

// Tier display config — no gradients, unified brand-gold palette
const TIER_CONFIG = {
  regular: {
    label: '一般會員',
  },
  vip: {
    label: 'VIP 會員',
  },
}

// Shorten a UUID-like id for the digital pass display
const formatMemberId = (id) => {
  if (!id) return '————'
  const str = String(id).replace(/-/g, '')
  return `${str.slice(0, 4)}···${str.slice(-4)}`
}

const MemberProfile = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const { toast } = useFeedback()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')

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

  const updateNameMutation = useMutation({
    mutationFn: (displayName) => updateMyProfile({ display_name: displayName }),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      updateUser(updatedProfile)
      setIsEditingName(false)
    },
    onError: (err) => {
      toast(getErrorMessage(err, '更新失敗'), 'error')
    },
  })

  const handleStartEditName = () => {
    setEditingName(profile?.display_name || '')
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (!editingName.trim()) {
      toast('姓名不能為空', 'error')
      return
    }
    updateNameMutation.mutate(editingName.trim())
  }

  const isLoading = profileLoading || txnLoading

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center select-none">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin text-gold mx-auto" />
          <p className="mt-5 text-[10px] text-stone-500 tracking-[0.3em] font-mono uppercase">
            Loading
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────
  if (profileError) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center px-4 select-none">
        <div className="text-center space-y-6">
          <AlertCircle size={28} className="text-stone-300 mx-auto" />
          <div>
            <p className="text-sm text-stone-700">無法載入資料</p>
            <p className="text-xs text-stone-500 mt-1">請確認您已登入，或稍後再試</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-gold text-gold text-xs tracking-widest hover:bg-gold hover:text-white transition-colors duration-300 rounded-sm"
          >
            <ArrowLeft size={13} />
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  const tier = TIER_CONFIG[profile?.tier] || TIER_CONFIG.regular
  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const hasTransactions = transactions.length > 0

  return (
    <>
      <Helmet>
        <title>會員中心 | 嫚霏 SPA</title>
      </Helmet>

      {/* Main wrapper — select-none prevents text highlight in LINE in-app browser */}
      <div className="min-h-screen bg-canvas select-none">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-24 space-y-4">

          {/* ── DIGITAL PASS CARD ─────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-sm p-8 relative overflow-hidden">

            {/* Subtle diagonal-stripe watermark in the background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, var(--color-gold) 0px, var(--color-gold) 1px, transparent 0px, transparent 10px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* MEMBER PASS label */}
            <p className="text-[10px] text-stone-500 tracking-[0.35em] font-mono uppercase">
              Member Pass · 嫚霏
            </p>

            {/* Member name in serif */}
            <h1 className="text-3xl font-serif font-normal text-stone-800 mt-3 mb-5 leading-none flex items-center gap-3">
              {profile?.display_name || '會員'}
              <button
                onClick={handleStartEditName}
                disabled={updateNameMutation.isPending}
                className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-stone-500 hover:text-gold transition-colors"
                title="編輯姓名"
              >
                <Edit size={18} />
              </button>
            </h1>

            {/* Tier badge + privileges link */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs tracking-widest bg-gold/10 text-gold border border-gold/20">
                {tier.label}
              </span>
              <Link
                to="/services"
                className="text-stone-500 text-xs hover:text-gold transition-colors duration-200 cursor-pointer"
              >
                查看專屬禮遇 →
              </Link>
            </div>

            {/* Member ID — digital pass feel, bottom-right */}
            <p className="text-[10px] text-stone-500 font-mono tracking-widest mt-8 text-right">
              ID · {formatMemberId(profile?.id)}
            </p>
          </div>

          {/* ── STATS ROW ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-sm p-6">
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                累計消費
              </p>
              <p className="text-4xl font-normal text-gold mt-2 tabular-nums">
                {totalSpent > 0 ? `$${totalSpent.toLocaleString()}` : '—'}
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-sm p-6">
              <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                到訪次數
              </p>
              <p className="text-4xl font-normal text-gold mt-2 tabular-nums">
                {transactions.length > 0 ? transactions.length : '—'}
              </p>
            </div>
          </div>

          {/* ── PERSONAL INFO CARD ────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-sm p-8">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.25em] font-mono mb-6">
              個人資料
            </p>
            <div className="divide-y divide-stone-100">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-500">姓名</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-800">{profile?.display_name || '—'}</span>
                  <button
                    onClick={handleStartEditName}
                    disabled={updateNameMutation.isPending}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-lg text-stone-500 hover:text-gold transition-colors"
                    title="編輯姓名"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-500">會員等級</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs tracking-widest bg-gold/10 text-gold border border-gold/20">
                  {tier.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-500">LINE ID</span>
                <span className="text-xs text-stone-500 font-mono">
                  {profile?.line_user_id ? `${profile.line_user_id.slice(0, 8)}···` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-500">加入日期</span>
                <span className="text-sm text-stone-800">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ── TRANSACTION LEDGER CARD ───────────────────── */}
          <div className="bg-white border border-stone-200 rounded-sm p-8">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.25em] font-mono mb-6">
              消費紀錄
            </p>

            {/* Error fetching transactions */}
            {txnError && (
              <div className="flex items-center gap-3 py-6 text-stone-500">
                <AlertCircle size={15} />
                <span className="text-xs">無法載入消費紀錄</span>
              </div>
            )}

            {/* Elegant empty state */}
            {!txnError && !hasTransactions && (
              <div className="text-center py-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-[10px] text-stone-500 font-mono tracking-widest">✦</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                <p className="text-sm text-stone-500 leading-loose tracking-wide">
                  期待為您帶來一場寧靜的身心之旅
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center border border-stone-300 text-stone-500 hover:border-gold hover:text-gold rounded-sm px-8 py-2.5 text-xs tracking-[0.2em] transition-colors duration-300"
                >
                  探索專屬療程
                </Link>
              </div>
            )}

            {/* Private banking ledger list */}
            {!txnError && hasTransactions && (
              <div>
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-start justify-between py-4 border-b border-stone-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-stone-800">{txn.service_name}</p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {new Date(txn.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-normal text-stone-800 tabular-nums pt-0.5">
                      ${txn.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* Ledger total row */}
                <div className="flex items-center justify-between pt-5">
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
                    Total
                  </span>
                  <span className="text-sm font-normal text-gold tabular-nums">
                    ${totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER NAV ────────────────────────────────── */}
          <div className="text-center pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-stone-500 hover:text-gold transition-colors duration-200 tracking-widest"
            >
              <ArrowLeft size={12} />
              返回首頁
            </Link>
          </div>

        </div>

        {/* Edit Name Modal */}
        <Modal
          isOpen={isEditingName}
          onClose={() => setIsEditingName(false)}
          title="編輯姓名"
          size="sm"
          footer={(
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveName}
                disabled={updateNameMutation.isPending}
                className="flex-1 px-6 py-2.5 min-h-[44px] bg-gold-deep text-white rounded-sm text-sm hover:brightness-90 transition-colors disabled:opacity-50"
              >
                {updateNameMutation.isPending ? <Loader2 size={14} className="inline animate-spin" /> : '保存'}
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="flex-1 px-6 py-2.5 min-h-[44px] border border-stone-200 text-stone-600 rounded-sm text-sm hover:bg-stone-50 transition-colors"
              >
                取消
              </button>
            </div>
          )}
        >
          <div className="px-6 py-6">
            <label htmlFor="member-display-name" className="block text-sm font-medium text-stone-700 mb-1.5">
              顯示姓名
            </label>
            <input
              id="member-display-name"
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-sm text-sm focus:ring-2 focus:ring-gold focus:border-gold"
            />
          </div>
        </Modal>
      </div>
    </>
  )
}

export default MemberProfile
