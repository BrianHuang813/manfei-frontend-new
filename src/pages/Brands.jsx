import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink } from 'lucide-react'

const LINE_URL = import.meta.env.VITE_LINE_URL || 'https://line.me/R/ti/p/PLACEHOLDER'

/* ── Brand data (mirrors FeaturedServices home component) ── */
const brands = [
  {
    id: 'reviderm',
    name: 'REVIDERM',
    tagline: '以科學的純粹，回應每一寸真實需求',
    image: '/images/reviderm_body.jpg',
    description:
      'REVIDERM 來自德國，專注於皮膚科學研究超過 30 年。以微針美療與高效活性成分，解決各種肌膚問題。每一款產品都經由皮膚科醫師驗證，為專業美膚沙龍及醫美診所所信賴。',
    features: ['德國皮膚科學研發', '微針美療技術', '高效活性成分配方'],
  },
  {
    id: 'drgrandel',
    name: 'DR. GRANDEL',
    tagline: '解碼你的獨家光澤方程式',
    image: '/images/drgrandel.jpg',
    description:
      'DR. GRANDEL 創立於 1947 年，是德國頂級院線保養品牌。以創新科研技術結合天然活性精華，為每一種膚質量身打造煥膚方案。70 餘年來深受歐洲專業美容師推薦。',
    features: ['70 年德國品牌傳承', '天然活性精華', '專業院線級保養'],
  },
  {
    id: 'innova',
    name: 'INNOVA',
    tagline: '以植研重啟妳的自信美學維度',
    image: '/images/innova.png',
    description:
      'INNOVA 以植物萃取科技為核心，開發出溫和而有效的護膚系列。堅持無添加有害化學成分的理念，為敏感肌膚帶來安心且卓越的保養體驗。',
    features: ['植物萃取科技', '敏感肌友善', '純淨無添加配方'],
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

/* ── Single brand section — overlapping asymmetric layout ── */
function BrandSection({ brand, index }) {
  const mirror = index % 2 !== 0

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={cardVariants}
      className={`grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-0 items-center ${
        index > 0 ? 'mt-20 md:mt-32' : ''
      }`}
    >
      {/* Image — spans 7 of 12 cols */}
      <div
        className={`md:col-span-7 ${mirror ? 'md:order-2 md:col-start-6' : 'md:col-start-1'}`}
      >
        <div className="overflow-hidden rounded-2xl shadow-md group">
          <img
            src={brand.image}
            alt={brand.name}
            loading="lazy"
            className="w-full aspect-[4/3] object-cover transition-all duration-700
                       grayscale-[15%] sepia-[8%] brightness-[0.95]
                       group-hover:grayscale-0 group-hover:sepia-0
                       group-hover:brightness-100 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Text card — spans 6 of 12 cols, overlaps image by 1 col */}
      <div
        className={`md:col-span-6 relative z-10 ${
          mirror
            ? 'md:order-1 md:col-start-1 md:text-right'
            : 'md:col-start-7'
        }`}
      >
        <div
          className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm
                      border border-stone-100 p-8 md:p-10 lg:p-12
                      ${mirror ? 'md:-mr-12' : 'md:-ml-12'}`}
        >
          <span className="text-gold text-xs tracking-[0.3em] uppercase">
            {brand.tagline}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider mt-3 mb-5">
            {brand.name}
          </h2>
          <p className="text-secondary/60 text-sm md:text-base leading-relaxed mb-6">
            {brand.description}
          </p>

          {/* Feature tags */}
          <div className={`flex flex-wrap gap-2 mb-6 ${mirror ? 'md:justify-end' : ''}`}>
            {brand.features.map((f) => (
              <span
                key={f}
                className="text-xs tracking-wide text-gold/80 border border-gold/20
                           rounded-full px-3 py-1"
              >
                {f}
              </span>
            ))}
          </div>

          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-gold text-sm tracking-wide
                       hover:text-gold-dark transition-colors duration-300 ${
                         mirror ? 'md:flex-row-reverse' : ''
                       }`}
          >
            LINE 諮詢了解
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function Brands() {
  return (
    <section className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="/images/reviderm_body.jpg"
          alt="Our Brands"
          className="absolute inset-0 w-full h-full object-cover
                     grayscale-[25%] sepia-[12%] brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        <div className="relative h-full flex flex-col justify-end pb-12 md:pb-16 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="block w-10 h-px bg-gold-light" />
              <span className="text-gold-light text-xs tracking-[0.3em] uppercase">
                Our Brands
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white tracking-wider">
              我們的品牌
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base max-w-md tracking-wide">
              嚴選歐洲頂級護膚品牌，為您呈現專業美學的精髓。
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom section-padding">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary/50 text-sm tracking-wide
                       hover:text-gold transition-colors duration-300"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>
        </motion.div>

        {/* Brand sections */}
        {brands.map((brand, i) => (
          <BrandSection key={brand.id} brand={brand} index={i} />
        ))}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 md:mt-32 text-center"
        >
          <p className="text-secondary/40 text-sm tracking-wide mb-6">
            想了解更多品牌資訊或預約體驗？
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-gold text-white rounded-full text-sm tracking-[0.2em]
                         transition-all duration-300 hover:bg-gold-dark"
            >
              LINE 諮詢
            </a>
            <Link
              to="/"
              className="inline-block px-8 py-3 border border-gold text-gold rounded-full text-sm tracking-[0.2em]
                         transition-all duration-300 hover:bg-gold hover:text-white"
            >
              返回首頁
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
