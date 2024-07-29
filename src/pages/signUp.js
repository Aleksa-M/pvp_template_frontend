import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignUp() {

    const [account, setAccount] = useState({
        user:"",
        pass:""
    });
    const [unique, setUnique] = useState(true)
    const [header, setHeader] = useState("Enter a unique username")

    const navigate = useNavigate()

    const handleChange = (e) => {
        setAccount(prev=>({...prev, [e.target.name]: e.target.value}))
    }
    const handleClick = async e => {
        e.preventDefault()
        try {
            const data = {
                "username": account.user,
                "password": account.pass,
            }
            const header = {
                "Content-Type": "application/json",
            }

            fetch("http://localhost:8008/log-in", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: header
            }).then(response => response.json())
                .then((res) => {
                    try {
                        console.log(res)
                        console.log(res[0])
                        console.log(res[0].user)
                        console.log(res[0].user == account.user)
                        console.log(res[0].pass)
                        console.log(res[0].pass == account.pass)
                        if (res[0].user == account.user) {
                            setHeader("User already exists")
                        }
                    } catch(err) {
                        if (res == []) {
                            setHeader("Weird")
                        } else {
                            setHeader("User already exists")
                        }
                    }}
                )   
            .catch(err => {console.log(err)})

            if (unique) {
                fetch("http://localhost:8008/sign-up", {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: header
                }).then(
                    navigate("/menu")
                )
                .catch(err => console.log(err))
            }
        }
        catch(err) {
            console.log(err)
        }
    }
    console.log(account)
    return (
        <div className="form">
            <h1>Sign Up</h1>
            <h2>{header}</h2>
            <input 
                type="text"
                placeholder="Username" 
                onChange={handleChange} name="user"
            />
            <input 
                type="password" 
                placeholder="Password" 
                onChange={handleChange} name="pass"
            />
            <button
                onClick={handleClick}>
                Submit
            </button>
        </div>
    )
}