import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'

import LandingPageLayout from './components/layouts/LandingPageLayout'
import Home from './pages/client/Home'
import NewsAndAnnouncement from './pages/client/NewsAndAnnouncement'
import Officials from './pages/client/Officials'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import SK from './pages/client/SK'
import FundTransparency from './pages/client/FundTransparency'
import HelpCenter from './pages/client/HelpCenter'
import TermsOfUse from './pages/client/TermsOfUse'
import ProvicyPolicy from './pages/client/ProvicyPolicy'



const App = () => {
    const router = createBrowserRouter(createRoutesFromElements(
        <Route path='/' element={<LandingPageLayout />}>
            <Route index element={<Home />}/>
            <Route path ='news_and_announcement' element={<NewsAndAnnouncement />}/>
            <Route path ='fund_transparency' element={<FundTransparency />}/>
            <Route path ='officials' element={<Officials />}/>
            <Route path ='sangguniang_kabataan' element={<SK />}/>
            <Route path="help-center" element={<HelpCenter />} />
            <Route path="terms-of-use" element={<TermsOfUse />} />
            <Route path="privacy-policy" element={<ProvicyPolicy />} />

            <Route path ='login' element={<Login />}/>
            <Route path ='register' element={<Register />}/>
        </Route>
    ))
  return (
    <RouterProvider router={router} />
  )
}

export default App