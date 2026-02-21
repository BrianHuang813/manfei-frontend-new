import { useQueries } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { fetchServices, fetchNews, fetchPortfolio, fetchTestimonials, fetchProducts } from '../api/public'

import Hero from '../components/home/Hero'
import LatestNews from '../components/home/LatestNews'
import SignatureServices from '../components/home/SignatureServices'
import HomeProducts from '../components/home/HomeProducts'
import FeaturedServices from '../components/home/FeaturedServices'
import Transformation from '../components/home/Transformation'
import CustomerReviews from '../components/home/CustomerReviews'

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "嬛霁美容 SPA (Manfei Spa)",
  "image": "https://www.manfeispa.com/images/hero-background.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "北榮街152號",
    "addressLocality": "West District",
    "addressRegion": "Chiayi City",
    "postalCode": "600",
    "addressCountry": "TW"
  },
  "telephone": "+886-5-2273758",
  "url": "https://www.manfeispa.com",
  "priceRange": "NT$600 - NT$15,000",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/manfei_spa/",
    "https://line.me/R/ti/p/@730rrkof"
  ]
}

export default function Home() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['public', 'services'],
        queryFn: fetchServices,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['public', 'news'],
        queryFn: () => fetchNews(5),
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['public', 'portfolio'],
        queryFn: fetchPortfolio,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['public', 'testimonials'],
        queryFn: fetchTestimonials,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['public', 'products'],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000,
      },
    ],
  })

  const [servicesQ, newsQ, portfolioQ, testimonialsQ, productsQ] = results

  return (
    <>
      {/* SEO: Page-specific meta + JSON-LD structured data */}
      <Helmet>
        <title>嬛霁美容 SPA｜嘉義頂級做臉、無痛清粉刺與身體舒壓</title>
        <meta
          name="description"
          content="位於嘉義的高級 SPA，提供專屬客製化護膚、身心靈精油按摩與高科技抗老療程。在靜謐的空間中，找回身心平衡與肌膚光澤。"
        />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      {/* 1. Hero — Full screen */}
      <Hero />

      {/* 2. Latest News — Magazine list (auto-hides if empty) */}
      <LatestNews news={newsQ.data ?? []} />

      {/* 3. Signature Services — Editorial Trio (3-col vertical) */}
      <SignatureServices services={servicesQ.data ?? []} />

      {/* 4. Home Products — Horizontal scroll gallery */}
      <HomeProducts products={productsQ.data ?? []} />

      {/* 5. Brand Showcase — Bento Grid (static brands) */}
      <FeaturedServices />

      {/* 6. Transformation — Visual before/after proof */}
      {/* TODO: 替換為專用 fetchTransformations API */}
      <Transformation cases={portfolioQ.data ?? []} />

      {/* 7. Customer Reviews — Hero quote + infinite marquee */}
      <CustomerReviews reviews={testimonialsQ.data ?? []} />
    </>
  )
}
