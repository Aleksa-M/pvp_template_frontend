import { useEffect, useState } from "react"
import cookieParser from '../cookieParser.js'

export function ProfilePage() {

    const [user, setUser] = useState();
    const [wins, setWins] = useState();
    const [losses, setLosses] = useState();

    useEffect(() => {
        const data = {
            "username": cookieParser(document.cookie).user,
        };
        const header = {
            "Content-Type": "application/json",
        };
        fetch('http://localhost:8008/find-account', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: header
        })
        .then(response => response.json())
        .then(res => {
            setUser(res[0].username)
            setWins(res[0].wins)
            setLosses(res[0].losses)
        });
    }, []);

    return (
        <div>
            <h1>User: {user}</h1>
            <h1>Wins: {wins}</h1>
            <h1>Losses: {losses}</h1>
        </div>
    );
}