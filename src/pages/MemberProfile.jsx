import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyProfile, fetchMyTransactions } from '../api/member'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

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

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center select-none">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin text-[#A89070] mx-auto" />
          <p className="mt-5 text-[10px] text-stone-400 tracking-[0.3em] font-mono uppercase">
            Loading
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────
  if (profileError) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 select-none">
        <div className="text-center space-y-6">
          <AlertCircle size={28} className="text-stone-300 mx-auto" />
          <div>
            <p className="text-sm text-stone-700">無法載入資料</p>
            <p className="text-xs text-stone-400 mt-1">請確認您已登入，或稍後再試</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#A89070] text-[#A89070] text-xs tracking-widest hover:bg-[#A89070] hover:text-white transition-colors duration-300 rounded-sm"
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
      <div className="min-h-screen bg-[#FAF9F6] select-none">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-24 space-y-4">

          {/* ── DIGITAL PASS CARD ─────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-sm p-8 relative overflow-hidden">

            {/* Subtle diagonal-stripe watermark in the background */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-[0.03]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #A89070 0px, #A89070 1px, transparent 0px, transparent 10px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* MEMBER PASS label */}
            <p className="text-[10px] text-stone-300 tracking-[0.35em] font-mono uppercase">
              Member Pass · 嫚霏
            </p>

            {/* Member name in serif */}
            <h1 className="text-3xl font-serif font-light text-stone-800 mt-3 mb-5 leading-none">
              {profile?.display_name || '會員'}
            </h1>

            {/* Tier badge + privileges link */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs tracking-widest bg-[#A89070]/10 text-[#A89070] border border-[#A89070]/20">
                {tier.label}
              </span>
              <Link
                to="/services"
                className="text-stone-400 text-xs hover:text-[#A89070] transition-colors duration-200 cursor-pointer"
              >
                查看專屬禮遇 →
              </Link>
            </div>

            {/* Member ID — digital pass feel, bottom-right */}
            <p className="text-[10px] text-stone-300 font-mono tracking-widest mt-8 text-right">
              ID · {formatMemberId(profile?.id)}
            </p>
          </div>

          {/* ── STATS ROW ─────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-sm p-6">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                累計消費
              </p>
              <p className="text-4xl font-light text-[#A89070] mt-2 tabular-nums">
                {totalSpent > 0 ? `$${totalSpent.toLocaleString()}` : '—'}
              </p>
            </div>
            <div className="bg-white border border-stone-200 rounded-sm p-6">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                到訪次數
              </p>
              <p className="text-4xl font-light text-[#A89070] mt-2 tabular-nums">
                {transactions.length > 0 ? transactions.length : '—'}
              </p>
            </div>
          </div>

          {/* ── PERSONAL INFO CARD ────────────────────────── */}
          <div className="bg-white border border-stone-200 rounded-sm p-8">
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.25em] font-mono mb-6">
              個人資料
            </p>
            <div className="divide-y divide-stone-100">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-400">姓名</span>
                <span className="text-sm text-stone-800">{profile?.display_name || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-400">會員等級</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs tracking-widest bg-[#A89070]/10 text-[#A89070] border border-[#A89070]/20">
                  {tier.label}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-400">LINE ID</span>
                <span className="text-xs text-stone-500 font-mono">
                  {profile?.line_user_id ? `${profile.line_user_id.slice(0, 8)}···` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-stone-400">加入日期</span>
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
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.25em] font-mono mb-6">
              消費紀錄
            </p>

            {/* Error fetching transactions */}
            {txnError && (
              <div className="flex items-center gap-3 py-6 text-stone-400">
                <AlertCircle size={15} />
                <span className="text-xs">無法載入消費紀錄</span>
              </div>
            )}

            {/* Elegant empty state */}
            {!txnError && !hasTransactions && (
              <div className="text-center py-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-[10px] text-stone-300 font-mono tracking-widest">✦</span>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>
                <p className="text-sm text-stone-400 leading-loose tracking-wide">
                  期待為您帶來一場寧靜的身心之旅
                </p>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center border border-stone-300 text-stone-500 hover:border-[#A89070] hover:text-[#A89070] rounded-sm px-8 py-2.5 text-xs tracking-[0.2em] transition-colors duration-300"
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
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                        {new Date(txn.created_at).toLocaleDateString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-sm font-light text-stone-800 tabular-nums pt-0.5">
                      ${txn.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}

                {/* Ledger total row */}
                <div className="flex items-center justify-between pt-5">
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">
                    Total
                  </span>
                  <span className="text-sm font-light text-[#A89070] tabular-nums">
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
              className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-[#A89070] transition-colors duration-200 tracking-widest"
            >
              <ArrowLeft size={12} />
              返回首頁
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}

export default MemberProfile
