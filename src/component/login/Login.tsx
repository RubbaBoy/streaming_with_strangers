import React, {FormEvent, useState} from 'react';
import './Login.scss';
import {useNavigate} from "react-router";
import {Simulate} from "react-dom/test-utils";
import {API_URL} from "../../index";

export const Login = () => {
    let navigate = useNavigate();

    const [error, setError] = useState<string | undefined>()

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        // @ts-ignore
        let username = event.target[0].value

        // @ts-ignore
        let password = event.target[1].value

        // @ts-ignore
        let twofa = event.target[2].value

        event.preventDefault();

        console.log('Here!');

        fetch(`${API_URL}/login`,
            {method: 'POST', body: JSON.stringify({
                    'username': username,
                    'password': password,
                    '2fa': twofa,
                })})
            .then(async res => {
                if (res.status != 200) {
                    console.log('Uh oh! ' + res.status);
                    return
                }

                let body = await res.json()
                if (body['token'] == 'ERROR') {
                    console.log('Login error');
                    setError('Invalid credentials')
                    return
                }

                console.log('Logged in with: ' + body['token'] + ' and ID of: ' + body['id']);

                localStorage.setItem('token', body['token'])
                localStorage.setItem('id', body['id'])
                localStorage.setItem('username', username)

                navigate('/')
            }).catch(_ => setError('Invalid credentials'))
    }

    return (
        <div className="body" >
            <div className="Login">
                <div className="title">Streaming with Strangers</div>
                <div className="box">
                    <form onSubmit={e => handleSubmit(e)}>
                        <div className={"username"}>
                            <p>Username</p>
                            <input type="text" name="username"/>
                        </div>
                        <div className={"password"}>
                            <p>Password</p>
                            <input type="password" name="password"/>
                        </div>
                        <div className={"twofactor"}>
                            <p>2FA</p>
                            <input type="number" name="twofactor"/>
                        </div>
                        <input type="submit" name="button" className="login" value="Log in"/>
                        <a href="/register" className="register">Register</a>

                        {error != undefined && <p className="error">{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    )
}
