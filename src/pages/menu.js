import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Menu() {
    console.log(document.cookie)
    
    return (
        <div>
        <nav>
        <ul>
            <li> <Link to="/computer"> computer </Link> </li>
            <li> <Link to="/player-match"> player match </Link> </li>
        </ul>       
        </nav>
        </div>
    )
}

/*function readAccountFromCookie() {
    let cookie = document.cookie
    const parsed = cookie.split("; ")
    return 
}*/