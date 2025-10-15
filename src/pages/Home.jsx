import React, { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import Banner from '../components/ui/Banner'
import CryptoList from '../components/ui/CryptoList'

import AOS from 'aos'
import 'aos/dist/aos.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home(){
  useEffect(() => {
    AOS.init({ once: true })
  }, [])

  return (
    <div className="body header-fixed home-2">
      <Header />
      <main>
        <Banner />
        <section className="crypto" data-aos="fade-up" data-aos-duration="1000">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                {/* The crypto cards - static HTML converted into React */}
                <div className="crypto__main">
                  {/* Four crypto-boxes — replicate markup from original for style */}
                  <div className="crypto-box">
                    <div className="left">
                      <span className="icon-btc"><span className="path1"></span><span className="path2"></span></span>
                      <h6>Bitcoin</h6>
                      <h6 className="price">USD 53,260.20</h6>
                    </div>
                    <div className="right">
                      <div id="total-revenue-chart-1"></div>
                      <p className="sale success">
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.393244 5.90568C0.477403 6.06168 0.637433 6.15893 0.811488 6.15893H3.52179V11.5105C3.52179 11.7807 3.73601 12 3.99996 12C4.26392 12 4.47814 11.7807 4.47814 11.5105V6.15893H7.18844C7.36313 6.15893 7.52316 6.06168 7.60668 5.90568C7.69148 5.74969 7.68574 5.5591 7.59329 5.40832L4.40482 0.228447C4.31683 0.0861572 4.16445 0 3.99996 0C3.83547 0 3.68309 0.0861572 3.59511 0.228447L0.406633 5.40832C0.358178 5.48795 0.333313 5.57868 0.333313 5.6694C0.333313 5.75034 0.353715 5.83193 0.393244 5.90568Z" fill="white"/></svg>
                        7.2%
                      </p>
                      <p className="unit">BTC</p>
                    </div>
                  </div>

                  {/* replicate the other boxes similarly... keep their original ids for charts */}
                  {/* For brevity, only the above box shown — replicate rest from original home-v2.html as needed. */}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="services">
          {/* replicate services section markup from original file */}
          <div className="container">
            <div className="row">
              <div className="col-xl-6 col-md-12">
                <div className="services__main">
                  {/* ...services-boxes (copy/paste markup from original file) */}
                </div>
              </div>
              <div className="col-xl-6 col-md-12">
                <div className="block-text" data-aos="fade-up" data-aos-duration="1000">
                  <h3 className="heading">The most trusted cryptocurrency platform.</h3>
                  <p className="desc">Cryptolly has a variety of features that make it the best place to start trading</p>
                  <a href="#" className="btn-action">Let’s Trade Now</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coin list / Market update */}
        <CryptoList />

        {/* replicate additional sections (about-2, work, etc.) similarly by copying markup */}
      </main>
    </div>
  )
}