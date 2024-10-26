import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cookieParser from '../cookieParser.js';

export function LogIn() {   

    console.log(document.cookie)    

    const [success,setSuccess] = useState("Enter account details")
    const [account,setAccount] = useState(
        {
            user:"",
            pass:""
        });

    const navigate = useNavigate()

    const handleChange = (e) =>  {
        setAccount(prev=>({...prev, [e.target.name]: e.target.value}))
    }

    const handleClick = async e => {
        e.preventDefault()
        try {
            console.log(account.user)
            console.log(account.pass)

            const data = {
                "username": account.user,
            }
            const header = {
                "Content-Type": "application/json",
            }
            fetch('http://localhost:8008/fetch-account', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: header
            }).then(response => response.json())
                .then(res => {
                    try {
                        console.log(res)
                        console.log(res[0])
                        console.log(res[0].user)
                        console.log(res[0].user == account.user)
                        console.log(res[0].pass)
                        console.log(res[0].pass == account.pass)
                        if ((res[0].user == account.user) && (res[0].pass == account.pass)) {
                            document.cookie = "user="+account.user
                            document.cookie = "pass="+account.pass
                            navigate("/menu")
                        } else {
                            setSuccess("Incorrect username or password")
                        }
                        console.log(success)
                    } catch(err) {
                        if (res == []) {
                            setSuccess("Incorrect username or password")
                        }
                    }})
            .catch(err => {console.log(err)})

        } catch(err) {
            console.log(err)
        }
    }
    
    console.log(account)

    useEffect(() => {
        if (cookieParser(document.cookie).user != "") {
            navigate("/menu")
        }
    })

    return (
        <div className="form">
            <h1>Log In</h1>
            <div>{success}</div>
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