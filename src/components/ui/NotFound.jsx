import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '@/components/ui/Typography';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <Typography variant="h1" color="muted" className="mt-2">Страница не найдена</Typography>
    
      <p className="text-gray-500 mt-2">К сожалению, такой страницы не существует или она была перемещена.</p>
      <Link 
        to="/home" 
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;