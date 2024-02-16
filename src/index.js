import React from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import AvatarAva from './AvatarAva.jsx';
import Home from './home/Home';
import './index.css';
import AvatarList from './avatarList/AvatarList.jsx';

document.title = "Eva Home";
const routesWithJSX = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Outlet />} >
      <Route path="" element={<AvatarList />} />
      <Route path="avatars" element={<Outlet />}>
        <Route path="" element={<AvatarList />} />
        <Route path="eva" element={<AvatarAva />} />
      </Route>
    </Route>
  ))

//  http://65.111.164.242:4001
const root = createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={routesWithJSX} />
);

