import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function SignUp() {

    const [account, setAccount] = useState({username:"", pass:""});
    const [state, setState] = useState("typing");

    const controller = new AbortController();

    const navigate = useNavigate()

    const handleChange = (e) => {
        setAccount(prev=>({...prev, [e.target.name]: e.target.value}))
    }
    const handleClick = async e => {
        e.preventDefault()
        setState("submitting")
    }

    const checkUnique = async (data) => {
        // uses find-account GET request to determine uniqueness of chosen username
        let header = {
            "Content-Type": "application/json",
        }
        let unique = await fetch("http://localhost:8008/find-account", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: header,
            signal: controller.signal
        })
        .then(response => response.json())
        .then((res) => {
            if (res.length != 0) {
                setState("taken")
                return false
            }
        })   
        .catch((err) => {
            setState("error")
            return false
        })
        return unique
    }

    const addAccount = async (data) => {
        // adds account to database
        let header = {
            "Content-Type": "application/json",
        }
        await fetch("http://localhost:8008/add-account", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: header
        })
        .catch(() => {setState("error")})
    }

    useEffect(() => {
        if (state === "submitting") {
            let data = {
                "username": account.username,
                "pass": account.pass,
                "wins": 0,
                "losses": 0,
            }

            let signUp = async () => {
                let isUnique = await checkUnique(data);
                if (!isUnique) return;
                addAccount(data);
            }
            signUp()
        }
        return () => {
            controller.abort()
        }
    }, [state])

    return (
        <div className="form">
            <h1>Sign Up</h1>
            <input 
                type="text"
                placeholder="Username"
                disabled={state === "submitting"}
                onChange={handleChange} name="username"
            />
            <input 
                type="password" 
                placeholder="Password"
                disabled={state === "submitting"}
                onChange={handleChange} name="pass"
            />
            <button
                onClick={handleClick}>
                Submit
            </button>
            {(state === "typing") && <p>Please create a Username and password. Your Username must be unique.</p>}
            {(state === "success") && <p>You have successfully created an account!</p>}
            {(state === "error") && <p>An error has occured, please try again.</p>}
            {(state === "submitting") && <p>Processing...</p>}
            {(state === "taken") && <p>There already exists an account with that username</p>}

        </div>
    )
}