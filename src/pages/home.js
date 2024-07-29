import { Link } from "react-router-dom";
import axios from 'axios';

export function Home() {
    return (
        <div>
        <nav>
        <ul>
            <li><Link to="./log-in"> Log In </Link></li>
            <li><Link to="./sign-up"> Sign Up </Link></li>
            <li><Link to="./account-list"> List of accounts </Link></li>
        </ul>
        </nav>
        </div>
    );
}