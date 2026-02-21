import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Check } from 'lucide-react'

const LINE_URL = import.meta.env.VITE_LINE_URL || 'https://line.me/R/ti/p/PLACEHOLDER'

const envImages = [
  { src: '/images/env3.jpg', alt: '嫚霏接待區' },
  { src: '/images/env2.jpg', alt: '嫚霏獨立美容室' },
  { src: '/images/env1.jpg', alt: '嫚霏舒適休息區' },
]

const promises = [
  '以肌膚為繭，以時間為翼，開啟生命的詩意美學。',
  '追求卓越「滿足客戶期待需求」「提供不可取代服務」，致力於為每位顧客創造獨特而美好的體驗。',
]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export default function About() {
  return (
    <section className="min-h-screen bg-background">
      {/* ── Hero Banner ── */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="/images/shop_cover.png"
          alt="嫚霏SPA工作室"
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
                About Us
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-white tracking-wider">
              關於嫚霏
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base max-w-md tracking-wide">
              煥活您的身心靈之美，體驗極致呵護
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

        {/* ── Brand Story — 品牌創立 & 品牌精神 ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center"
        >
          {/* Text side */}
          <div>
            <motion.div variants={fadeUp} className="space-y-8">
              {/* 品牌創立 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="block w-8 h-px bg-gold" />
                  <span className="text-gold text-xs tracking-[0.3em] uppercase">Brand Story</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider mb-5">
                  品牌創立
                </h2>
                <p className="text-secondary/60 text-sm md:text-base leading-relaxed">
                  「嫚霏SPA」的誕生，源自於對女性生命力的深刻同理心。致力於成為女性蛻變的見證者與守護者——讓每一次護理，都是破繭的儀式；讓每一寸肌膚，都成為蝶翼舒展的舞台。
                </p>
              </div>

              {/* 品牌精神 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="block w-8 h-px bg-gold" />
                  <span className="text-gold text-xs tracking-[0.3em] uppercase">Brand Spirit</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider mb-5">
                  品牌精神
                </h2>
                <p className="text-secondary/60 text-sm md:text-base leading-relaxed">
                  以頂級芳療空間為繭，以美療師的掌心為翼，開啟「與自己坦誠相見」的靜謐革命。我們相信，真正的歸屬感，是當你走出大門的那一刻，帶著我們共同發現的真理，不是讓你「變完美」，而是讓你發現：「原來我的裂痕，也能變成彩虹」。
                </p>
              </div>
            </motion.div>
          </div>

          {/* Image side */}
          <motion.div
            variants={fadeUp}
          >
            <div className="overflow-hidden rounded-2xl shadow-md group">
              <img
                src="/images/shop_cover.png"
                alt="嫚霏工作室優雅環境"
                loading="lazy"
                className="w-full aspect-[4/3] object-cover transition-all duration-700
                           grayscale-[15%] sepia-[8%] brightness-[0.95]
                           group-hover:grayscale-0 group-hover:sepia-0
                           group-hover:brightness-100 group-hover:scale-[1.02]"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ── 品牌承諾 ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-24 md:mt-32"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="block w-8 h-px bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">Our Promise</span>
              <span className="block w-8 h-px bg-gold" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
              品牌承諾
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="max-w-3xl mx-auto space-y-6"
          >
            {promises.map((text, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-4 bg-white/80 backdrop-blur-sm rounded-2xl
                           border border-stone-100 p-6 md:p-8 shadow-sm"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center mt-0.5">
                  <Check size={16} className="text-gold" />
                </span>
                <p className="text-secondary/70 text-sm md:text-base leading-relaxed">
                  {text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── 環境介紹 ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mt-24 md:mt-32"
        >
          <motion.div variants={fadeUp} className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="block w-8 h-px bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase">Our Space</span>
              <span className="block w-8 h-px bg-gold" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-secondary tracking-wider">
              環境介紹
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-center text-secondary/50 text-sm md:text-base max-w-2xl mx-auto mb-12 leading-relaxed tracking-wide"
          >
            我們精心打造了一個舒適、隱私且充滿美感的空間，從柔和的燈光、舒緩的音樂到淡雅的香氛，每一個細節都為了讓您在踏入嫚霏的瞬間即感受到全然的放鬆與愉悅。
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {envImages.map((img, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="overflow-hidden rounded-2xl shadow-md group"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover transition-all duration-700
                             grayscale-[15%] sepia-[8%] brightness-[0.95]
                             group-hover:grayscale-0 group-hover:sepia-0
                             group-hover:brightness-100 group-hover:scale-[1.03]"
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 md:mt-32 text-center"
        >
          <p className="text-secondary/40 text-sm tracking-wide mb-6">
            想深入了解或預約體驗？
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-white rounded-full text-sm tracking-[0.2em]
                         transition-all duration-300 hover:bg-gold-dark"
            >
              LINE 諮詢
              <ExternalLink size={14} />
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
