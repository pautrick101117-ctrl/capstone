import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'

import LandingPageLayout from './components/layouts/LandingPageLayout'
import Home from './pages/client/Home'
import NewsAndAnnouncement from './pages/client/NewsAndAnnouncement'
import Officials from './pages/client/Officials'
import Login from './pages/client/Login'
import Register from './pages/client/Register'



const App = () => {
    const router = createBrowserRouter(createRoutesFromElements(
        <Route path='/' element={<LandingPageLayout />}>
            <Route index element={<Home />}/>
            <Route path ='news_and_announcement' element={<NewsAndAnnouncement />}/>
            <Route path ='officials' element={<Officials />}/>
            <Route path ='login' element={<Login />}/>
            <Route path ='register' element={<Register />}/>
        </Route>
    ))
  return (
    <RouterProvider router={router} />
  )
}

export default App