import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FloatingCTA from '../components/FloatingCTA'
import StickyBookingBar from '../components/StickyBookingBar'

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingCTA />
      <StickyBookingBar />
    </>
  )
}
