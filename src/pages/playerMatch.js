import { Link } from "react-router-dom";
import { useState } from 'react';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io.connect("http://localhost:3001");

export function PlayerMatch() {

    const sendMessage = () => {
        console.log("sent message function")
        socket.emit("send_message", { message: "Hello"})
    }
    
    useEffect(() => {
        socket.on("receive_message", (data) => {
            alert(data.message)
        })  
    }, [socket]);

    return (
        <div>
            Player Match
            <input placeholder="Message..." />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}