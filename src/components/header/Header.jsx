import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'
import { Button } from '@/components/ui/Button';

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn, currentUser } = useAuth()
    
    // Получаем роль (из контекста или localStorage)
    const userRole = localStorage.getItem('userRole');

    return (
        <nav className='flex flex-row gap-x-4 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200'>
            <Link className='text-sm text-blue-700 font-bold' to='/i2i'>i2i</Link>
            <Link className='text-sm text-blue-700 font-bold' to='/i2t'>i2t</Link>
            <Link className='text-sm text-blue-700 font-bold' to='/t2v'>t2v</Link>
            <Link className='text-sm text-blue-700 font-bold' to='/delivery-chat'>delivery chat</Link>

            {/* Ссылка видна ТОЛЬКО админу */}
            {userLoggedIn && userRole === 'admin' && (
                <Link className='text-sm text-red-600 font-bold border border-red-600 px-2 rounded' to='/admin/users'>
                    Admin Panel
                </Link>
            )}
            

            {userLoggedIn
                ? <button onClick={() => { 
                    doSignOut().then(() => { 
                        localStorage.removeItem('userRole'); // Чистим роль при выходе
                        navigate('/login');
                    }) 
                }} className='text-sm text-blue-600 underline'>Logout</button>
                : <>
                    <Link className='text-sm text-blue-600 underline' to={'/login'}>Login</Link>
                    <Link className='text-sm text-blue-600 underline' to={'/register'}>Register</Link>
                </>
            }
        </nav>
    )
}

export default Header