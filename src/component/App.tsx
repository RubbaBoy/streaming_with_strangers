import React, {Fragment, ReactElement} from "react";
import {Navigate, Routes} from "react-router-dom";
import {Route} from "react-router";
import {Home} from "./home/Home";
import {Watch} from "./watch/Watch";
import {Login} from "./login/Login";
import {Register} from "./register/Register";

/**
 * The top-level component of the application.
 * Paths under /admin and /dj are restricted, and require authentication before access.
 */
export const App = () => {
    return (
        <Fragment>
            <Routes>
                <Route path="/" element={<Home/>}>
                    <Route index element={<Home/>}/>
                </Route>
                <Route path="/watch/:id" element={<Watch/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
            </Routes>
        </Fragment>
    );
}
