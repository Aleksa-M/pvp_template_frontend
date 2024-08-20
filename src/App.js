import { Route, Routes } from 'react-router-dom';
import { Computer } from './pages/computer';
import { PlayerMatch } from './pages/playerMatch';
import { Menu } from './pages/menu';
import { LogIn } from './pages/logIn';
import { SignUp } from './pages/signUp';
import { AccountList } from './pages/accountList';  
import { Home } from './pages/home';
import { io } from 'socket.io-client';
import { useState } from 'react';

function App() {

  

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/account-list" element={<AccountList />} />
      <Route path="/sign-up" element={<SignUp />} /> 
      <Route path="/log-in" element={<LogIn />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/computer" element={<Computer />} />
      <Route path="/player-match" element={<PlayerMatch />} />
    </Routes>
  );
}



export default App;
