import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import cookieParser from '../cookieParser';
 
const socket = io.connect("http://localhost:3001");

export function PlayerMatch() {

    const [msg, setMessage] = useState({ text: "" })

    const navigate = useNavigate();
    useEffect(() => {
        if (cookieParser(document.cookie).user == "") {
            navigate("/log-in")
        }
    })

    const updateMessage = (e) => {
        setMessage(prev=>({...prev, [e.target.name]: e.target.value}))
    }

    const sendMessage = () => {
        console.log("sent message function")
        socket.emit("send_message", { message: msg.text})
    }
    
    useEffect(() => {
        socket.on("receive_message", (data) => {
            alert(data.message)
        })  
    }, [socket]);

    console.log(msg)

    return (
        <div>
            Player Match
            <input 
                onChange={updateMessage} 
                name="text"
                placeholder="Message..." />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}