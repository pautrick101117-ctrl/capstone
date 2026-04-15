import { Outlet } from 'react-router-dom'

const AdminPageLayout = () => {
  return (
    <>
        <nav></nav>
        <Outlet />
        <footer></footer>
    </>
  )
}

export default AdminPageLayout