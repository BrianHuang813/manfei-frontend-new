import { useQueries } from '@tanstack/react-query'
import { fetchServices, fetchNews, fetchPortfolio, fetchTestimonials, fetchProducts } from '../api/public'

import Hero from '../components/home/Hero'
import LatestNews from '../components/home/LatestNews'
import SignatureServices from '../components/home/SignatureServices'
import HomeProducts from '../components/home/HomeProducts'
import FeaturedServices from '../components/home/FeaturedServices'
import Transformation from '../components/home/Transformation'
import CustomerReviews from '../components/home/CustomerReviews'

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
