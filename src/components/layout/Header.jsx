import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  const [openMenu, setOpenMenu] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [assetsOpen, setAssetsOpen] = useState(false)
  const [tradesOpen, setTradesOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const toggle = (setter) => setter(s => !s)

  return (
    <header id="header_main" className="header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="header__body d-flex justify-content-between">
              <div className="header__left d-flex">
                <div className="logo">
                  <Link to="/" className="light">
                    <img id="site-logo" src="/assets/images/logo/logo.png" alt="" width="118" height="32" />
                  </Link>
                  <Link to="/" className="dark">
                    <img src="/assets/images/logo/logo-dark.png" alt="" width="118" height="32" />
                  </Link>
                </div>

                <div className="left__main">
                  <nav id="main-nav" className="main-nav">
                    <ul className="menu">
                      <li className="menu-item-has-children current-menu-item">
                        <a href="#">Homepage</a>
                        <ul className="sub-menu">
                          <li className="menu-item"><Link to="/">Home 01</Link></li>
                          <li className="menu-item current-item"><Link to="/">Home 02</Link></li>
                          <li className="menu-item"><a href="/home-v3">Home 03</a></li>
                        </ul>
                      </li>
                      <li className="menu-item"><a href="/markets">Markets</a></li>
                      {/* Keep other menu items */}
                    </ul>
                  </nav>
                </div>
              </div>

              <div className="header__right d-flex align-items-center">
                <div className="dropdown">
                  <button className="btn" onClick={() => toggle(setAssetsOpen)}>Assets</button>
                  {assetsOpen && (
                    <div className="dropdown-menu show">
                      <a className="dropdown-item" href="#">Binance Visa Card</a>
                      <a className="dropdown-item" href="#">Crypto Loans</a>
                      <a className="dropdown-item" href="#">Binance Pay</a>
                    </div>
                  )}
                </div>

                <div className="dropdown">
                  <button className="btn" onClick={() => toggle(setTradesOpen)}>Orders & Trades</button>
                  {tradesOpen && (
                    <div className="dropdown-menu show">
                      <a className="dropdown-item" href="#">Binance Convert</a>
                      <a className="dropdown-item" href="#">Spot</a>
                      <a className="dropdown-item" href="#">Margin</a>
                      <a className="dropdown-item" href="#">P2P</a>
                    </div>
                  )}
                </div>

                <div className="dropdown">
                  <button className="btn" onClick={() => toggle(setLangOpen)}>EN/USD</button>
                  {langOpen && (
                    <div className="dropdown-menu show">
                      <button className="dropdown-item">English</button>
                      <button className="dropdown-item">Spanish</button>
                      <button className="dropdown-item">German</button>
                      <button className="dropdown-item">Italian</button>
                      <button className="dropdown-item">Russian</button>
                    </div>
                  )}
                </div>

                <div className="mode-switcher">
                  {/* Replace inline onclick with React handler */}
                  <button className="sun" onClick={() => document.documentElement.classList.toggle('dark')}>
                    {/* sun svg */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M7.99993 11.182C9.7572 11.182 11.1818 9.75745 11.1818 8.00018C11.1818 6.24291 9.7572 4.81836 7.99993 4.81836C6.24266 4.81836 4.81812 6.24291 4.81812 8.00018C4.81812 9.75745 6.24266 11.182 7.99993 11.182Z" stroke="#23262F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>

                <div className="mobile-button"><span onClick={() => setOpenMenu(s => !s)}></span></div>

                <div className="wallet"><a href="/wallet"> Wallet </a></div>

                <div className="dropdown user">
                  <button className="btn" onClick={() => toggle(setUserOpen)}>
                    <img src="/assets/images/avt/avt-01.jpg" alt="" />
                  </button>

                  {userOpen && (
                    <div className="dropdown-menu show">
                      <a className="dropdown-item" href="#"><span>Profile</span></a>
                      <a className="dropdown-item" href="#"><span>My Wallet</span></a>
                      <a className="dropdown-item d-block" href="#"><span>Settings</span></a>
                      <a className="dropdown-item" href="#"><span>Lock screen</span></a>
                      <div className="dropdown-divider" />
                      <a className="dropdown-item text-danger" href="/user-login"><span>Logout</span></a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  )
}