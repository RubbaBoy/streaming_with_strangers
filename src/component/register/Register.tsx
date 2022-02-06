import React, {Fragment, FormEvent, useState, createRef, useEffect} from 'react';
import './Register.scss';
import {API_URL} from "../../index";
import {useNavigate} from "react-router";

export const Register = () => {
    let navigate = useNavigate();

    const [qrCode, setQrCode] = useState<string | undefined>()

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        // @ts-ignore
        let username = event.target[0].value

        // @ts-ignore
        let email = event.target[1].value

        // @ts-ignore
        let password = event.target[2].value

        event.preventDefault();

        console.log('Here!');

        await fetch(`${API_URL}/register`,
            {method: 'POST', body: JSON.stringify({
                    'username': username,
                    'password': password,
                    'email': email,
                })})
            .then(async res => {
                console.log('then');

                if (res.status != 200) {
                    console.log('Uh oh! ' + res.status);
                    return
                }

                let body = await res.json()
                if (body['token'] == 'ERROR') {
                    console.log('Login error');
                    return
                }

                console.log('Logged in with ' + body['token']);
                console.log('User ID: ' + body['id']);
                console.log('Got URI: ' + body['uri']);

                localStorage.setItem('token', body['token'])
                localStorage.setItem('id', body['id'])
                localStorage.setItem('username', username)

                setQrCode(`https://api.qrserver.com/v1/create-qr-code/?data=${body['uri']}&size=250x250&bgcolor=#FFFFFF`)
            })
    }

    async function handleVerify(event: FormEvent<HTMLFormElement>) {
        // @ts-ignore
        let code = event.target[0].value

        event.preventDefault()

        console.log('Got code: ' + code);

        await fetch(`${API_URL}/register_verify`, {
            method: 'POST',
            body: JSON.stringify({
                'token': localStorage.getItem('token') ?? '',
                'code': code,
            })
        }).then(async res => {
            let json = await res.json()
            if (!json['login']) {
                console.log('Bad login!');
                alert('Bad 2FA!')
            } else {
                navigate('/')
            }
        })
    }

    return (
        <div className="body" >
            <div className="Register">
                <img src="/images/logo.png" alt="logo"/>
                <div className="box">
                    {qrCode == undefined && <form onSubmit={e => handleSubmit(e)}>
                        <div className={"username"}>
                            <p>Username</p>
                            <input type="text" name="username"/>
                        </div>
                        <div className={"email"}>
                            <p>Email</p>
                            <input type="email" name="email"/>
                        </div>
                        <div className={"password"}>
                            <p>Password</p>
                            <input type="password" name="password"/>
                        </div>
                        <input type="submit" name="button" value="Register"/>
                    </form>}

                    {qrCode != undefined && <Fragment>
                        <p className="otc">Put this in your authenticator app: </p>
                        <img src={qrCode ?? ''} alt='QR Code' className="qr-code"/>
                        <form onSubmit={e => handleVerify(e)}>
                            <div className="code">
                                <p>One Time Code</p>
                                <input type="number" name="code"/>
                            </div>
                            <input type="submit" name="button" value="Register"/>
                    </form>
                    </Fragment>}
                </div>
            </div>
        </div>
    )
}
