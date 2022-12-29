import React, { Component } from 'react'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'

import { api_connect } from '../src/functions/functions'
import Home from './Pages/Home'
import Testers from './Pages/Testers'
import ErrorPage from './Pages/ErrorPage'
import ProductList from './components/ProductList'
import Product from './components/Product/Product'
import MachineGroupList from './components/Machines/MachineGroupList'
import MachineGroup from './components/Machines/MachineGroup'
import MachinePage from './components/Machines/MachinePage'
import ContactList from './components/ContactList/ContactList'
import TestSuiteList from './components/TestSuites/TestSuiteList'
import TestSuitePage from './components/TestSuites/TestSuitePage'
import AutorunItemList from './components/AutorunItemList/AutorunItemList'
import BuildResultList from './components/Builds&Results/BuildResultList'


function App(){
    return (
        <>
          <Router className=''>
            <nav className="nav">
                <Link to="/" className='nav-link'>Builds&Results</Link>
                {/* <Link to="/testers" className='nav-link'>Testers</Link> */}
                <Link to="/products" className='nav-link'>Products</Link>
                <Link to="/contacts" className='nav-link'>Contacts</Link>
                <Link to="/mgroup-list" className='nav-link'>MachineGroup</Link>
                <Link to="/tsuite-list" className='nav-link'>TestSuites</Link>
                <Link to="/autorun-list" className='nav-link'>AutorunItem</Link>
                {/* <Link to="/build-list" className='nav-link'>Builds&Results</Link> */}
            </nav>
            <Routes>
                <Route path="/" element={<BuildResultList />}   />
                {/* <Route path="/testers" element={<Testers />}   /> */}
                <Route path="/products" element={<ProductList />}   />
                <Route path="/contacts" element={<ContactList />}   />
                <Route path="/product/:id" element={<Product />}   />
                <Route path="/mgroup/:id" element={<MachineGroup />}   />
                <Route path='/mgroup-list' element={<MachineGroupList />} />
                <Route path='/machine/:id' element={<MachinePage />} />
                <Route path='/tsuite-list' element={<TestSuiteList />} />
                <Route path='/tsuite/:id' element={<TestSuitePage />} />
                <Route path='/autorun-list' element={<AutorunItemList />} />
                {/* <Route path='/build-list' element={<BuildsResultsList />} /> */}
                <Route path="*" element={<ErrorPage />}   />
            </Routes>
          </Router>
        </>
    )
  }
export default App;
api_connect();
