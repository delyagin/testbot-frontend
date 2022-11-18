import React, { Component } from 'react'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'

import { api_connect } from '../src/functions/functions'
import Home from './Pages/Home'
import Testers from './Pages/Testers'
import ErrorPage from './Pages/ErrorPage'
import ProductList from './components/ProductList'
import Product from './components/Product'


function App(){
    return (
        <>
            <Router>
                <nav className="nav">
                    <Link to="/" className='nav-link'>Home</Link>
                    <Link to="/testers" className='nav-link'>Testers</Link>
                    <Link to="/products" className='nav-link'>Products</Link>
                    {/* <Link to="/products/%id" className='nav-link'>Products</Link> */}
                    {/* <Link>Home</Link> */}
                </nav>
                <Routes>
                    <Route path="/" element={<Home />}   />
                    <Route path="/testers" element={<Testers />}   />
                    <Route path="/products" element={<ProductList />}   />
                    <Route path="/products/:id" element={<Product />}   />
                    <Route path="*" element={<ErrorPage />}   />
                </Routes>
            </Router>
        </>
    )
  }
export default App;
api_connect();
