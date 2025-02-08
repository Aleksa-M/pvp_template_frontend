import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from 'react';
import cookieParser from '../cookieParser';

export function PlayerMatch() {
    const connection = useRef(null)                     // socket
    const navigate = useNavigate();                     // send them back to log-in
    const [srvrMsg, setSrvrMsg] = useState("");         // msg to be sent
    const [localMsg, setLocalMsg] = useState("");       // global msg that should be displayed to all users

    // Socket hook
    useEffect(() => {
        console.log("start")
        // Socket object
        const socket = new WebSocket("ws://localhost:3001?user="+cookieParser(document.cookie).user) // url must be the same as app, but with ws protocol instead of http

        // Socket listen for connection opened
        socket.addEventListener("open", () => {
            console.log("skib")
        })

        // Socket listen for messages
        socket.addEventListener("message", (event) => {
            console.log("Message recieved: ", event.data)
            setSrvrMsg(event.data)
        })

        // Socket listen for close

        connection.current = socket

        //return () => (connection.current).close()
    }, [connection])

    // take user back to log-in if they are not logged in
    useEffect(() => {
        if (cookieParser(document.cookie).user == "") {
            navigate("/log-in")
        }
    }, [])

    const handleChange = (e) =>  {
        setLocalMsg(e.target.value)
    }

    const sendMessage = (e) => {
        connection.current.send(localMsg)
        console.log("sending message: "+localMsg)
    }

    return (
        <div>
            Player Match
            <input
                onChange={handleChange}
                name="text"
                placeholder="Message..." />
            <button onClick={sendMessage}>Send</button>
            <p>local message: {localMsg}</p>
            <br></br>
            <p>global message: {srvrMsg}</p>
        </div>
    );
}