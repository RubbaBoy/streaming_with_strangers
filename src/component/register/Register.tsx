import React, {Fragment, FormEvent, useState} from 'react';
import './Register.scss';

export const Register = () => {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        // @ts-ignore
        let username = event.target[0].value

        // @ts-ignore
        let email = event.target[1].value

        // @ts-ignore
        let password = event.target[2].value

        event.preventDefault();

        console.log('Here!');

        await fetch(`http://localhost:5000/register`,
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
                console.log('Got URI: ' + body['uri']);

                localStorage.setItem('token', body['token'])
                localStorage.setItem('username', username)

                setVerify(body['uri'])
            })
    }

    async function handleVerify(event: FormEvent<HTMLFormElement>) {
        // @ts-ignore
        let code = event.target[0].value

        console.log('Got code: ' + code);

        await fetch('http://localhost:5000/register_verify', {
            method: 'POST',
            body: JSON.stringify({
                'token': localStorage.getItem('token') ?? '',
                'code': code,
            })
        }).then(async res => {
            let json = await res.json()
            if (!json['login']) {
                console.log('Bad login!');
            }
        })
    }

    const [verify, setVerify] = useState<string | undefined>()

    return (
        <div className="body" >
            <div className="Register">
                <div className="title">Streaming with Strangers</div>
                <div className="box">
                    {verify == undefined && <form onSubmit={e => handleSubmit(e)}>
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

                    {verify != undefined && <Fragment>
                        <p className="otc">Put this in your authenticator app: <span>{verify}</span></p>
                        <form onSubmit={e => handleVerify(e)}>
                            <div className={"code"}>
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
