
import { Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import MainPage from './Pages/MainPage/MainPage'
import CatalogPage from './Pages/CatalogPage/CatalogPage'
import GalleryPage from './Pages/GalleryPage/GalleryPage'
import RegisterPage from './Pages/RegisterPage/RegisterPage'
import AuthenticationPage from './Pages/AuthenticationPage/AuthenticationPage'
import Breadcrumbs from './Components/Breadcrumbs/Breadcrumbs'
import ScrollUp from './Components/ScrollUp/ScrollUp'

function App() {
    const location = useLocation();

    return (
        <>
            {location.pathname !== '/' && <Breadcrumbs />}
            <ScrollUp />
            <Routes>
                <Route path='/' element={ <MainPage/> } />
                <Route path='/catalog' element={ <CatalogPage/> } />
                <Route path='/gallery' element={ <GalleryPage/> } />
                <Route path='/register' element={ <RegisterPage/> } />
                <Route path='/login' element={ <AuthenticationPage/> } />
            </Routes>
        </>
    )
}

export default App
