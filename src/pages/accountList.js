import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export function AccountList() {

    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchAllAccounts = async () => {
            try {
                const res = await axios({
                    method:'get',
                    url:'http://localhost:8008/fetch-accounts'
                })
                console.log(res.data)
                setAccounts(res.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchAllAccounts();
    }, accounts);

    console.log(accounts);

    return (
        <div>
            <h1> list of accounts </h1>
            <div>
                {accounts.map((account) => (
                    <div>
                        <h2>id: {account.id} </h2>
                        <h3>user: {account.user}</h3>
                        <h3>pass: {account.pass}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}