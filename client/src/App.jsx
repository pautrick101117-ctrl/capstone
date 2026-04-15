import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'

import LandingPageLayout from './components/layouts/LandingPageLayout'
import Home from './pages/client/Home'
import NewsAndAnnouncement from './pages/client/NewsAndAnnouncement'
import Officials from './pages/client/Officials'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import FundTransparency from './pages/client/FundTransparency'
import HelpCenter from './pages/client/HelpCenter'
import TermsOfUse from './pages/client/TermsOfUse'
import ProvicyPolicy from './pages/client/ProvicyPolicy'
import VotingCenter from './pages/client/VotingCenter'
import VotingResult from './pages/client/VotingResult'
import UserDashboard from './pages/client/UserDashboard'

import AdminPageLayout from './components/layouts/AdminPageLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Admin_Residents from './pages/admin/Admin_Residents'
import Admin_Officials from './pages/admin/Admin_Officials'
import Admin_Clearances from './pages/admin/Admin_Clearances'
import Admin_Complaints from './pages/admin/Admin_Complaints'
import Admin_Census from './pages/admin/Admin_Census'
import Admin_Settings from './pages/admin/Admin_Settings'
import Admin_VotingResult from './pages/admin/Admin_VotingResult'
import AdminLogin from './pages/admin/AdminLogin'
import UserPortalLayout from './components/layouts/UserPortalLayout'
import { ProtectedRoute } from './components/routes/ProtectedRoute'


const App = () => {
    const router = createBrowserRouter(createRoutesFromElements(
        <>
        <Route path='/' element={<LandingPageLayout />}>
            <Route index element={<Home />}/>
            <Route path ='news_and_announcement' element={<NewsAndAnnouncement />}/>
            <Route path ='fund_transparency' element={<FundTransparency />}/>
            <Route path ='officials' element={<Officials />}/>
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="terms-of-use" element={<TermsOfUse />} />
            <Route path="privacy-policy" element={<ProvicyPolicy />} />
            <Route path="voting-result" element={<VotingResult />} />

            <Route path ='login' element={<Login />}/>
            <Route path ='register' element={<Register />}/>
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<UserPortalLayout />}>
                <Route path="portal" element={<UserDashboard />} />
                <Route path="voting-center" element={<VotingCenter />} />
            </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['super_admin', 'staff']} redirectTo="/admin/login" />}>
            <Route path="admin" element={<AdminPageLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="residents" element={<Admin_Residents />} />
                <Route path="officials" element={<Admin_Officials />} />
                <Route path="clearances" element={<Admin_Clearances />} />
                <Route path="complaints" element={<Admin_Complaints />} />
                <Route path="census" element={<Admin_Census />} />
                <Route path="settings" element={<Admin_Settings />} />
                <Route path="voting" element={<Admin_VotingResult />} />
            </Route>
        </Route>
        </>
    ))
  return (
    <RouterProvider router={router} />
  )
}

export default App
