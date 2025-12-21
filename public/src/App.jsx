
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import MainPage from './Pages/MainPage/MainPage'
import CatalogPage from './Pages/CatalogPage/CatalogPage'
import GalleryPage from './Pages/GalleryPage/GalleryPage'
import RegisterPage from './Pages/RegisterPage/RegisterPage'
import AuthenticationPage from './Pages/AuthenticationPage/AuthenticationPage'
import AdminPage from './Pages/AdminPage/AdminPage'
import ProfilePage from './Pages/ProfilePage/ProfilePage'
import PageOfSelectProduct from './Pages/PageOfSelectProduct/PageOfSelectProduct'
import CartPage from './Pages/ShapingCart/CartPage'
import BuyPage from './Pages/BuyPage/BuyPage'
import GiveMoneyPage from './Pages/GiveMoneyPage/GiveMoneyPage'
import CustomOrderPage from './Pages/CustomOrderPage/CustomOrderPage'
import Breadcrumbs from './Components/Breadcrumbs/Breadcrumbs'
import ScrollUp from './Components/ScrollUp/ScrollUp'

function App() {
    const location = useLocation();

    return (
        <>
            {location.pathname !== '/' && location.pathname !== '/admin' && <Breadcrumbs />}
            <ScrollUp />
            <Routes>
                <Route path='/' element={ <MainPage/> } />
                <Route path='/catalog' element={ <CatalogPage/> } />
                <Route path='/gallery' element={ <GalleryPage/> } />
                <Route path='/register' element={ <RegisterPage/> } />
                <Route path='/login' element={ <AuthenticationPage/> } />
                <Route path='/profile' element={ <ProfilePage/> } />
                <Route path='/product' element={ <PageOfSelectProduct/> } />
                <Route path='/cart' element={ <CartPage/> } />
                <Route path='/buy' element={ <BuyPage/> } />
                <Route path='/payment' element={ <GiveMoneyPage/> } />
                <Route path='/custom-order' element={ <CustomOrderPage/> } />
                <Route path='/admin' element={ <AdminPage/> } />
            </Routes>
        </>
    )
}

export default App
