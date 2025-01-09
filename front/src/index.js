import React from 'react';
import ReactDOM from 'react-dom/client';

import {createBrowserRouter, RouterProvider} from "react-router-dom"

export const backendAdd = (path) => {
  return 'http://localhost:5000/api' + path
} 

//List pages here & add to router
import Home from './pages/Home'
import Admin from './pages/Admin'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/admin",
    element: <Admin />
  },
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
