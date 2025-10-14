import React from 'react'

export default function CryptoList(){
  return (
    <section className="coin-list">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="block-text">
              <h3 className="heading">Market Update</h3>
              <a className="btn-action" href="#">See All Coins</a>
            </div>

            <div className="coin-list__main">
              <div className="flat-tabs">
                <ul className="menu-tab">
                  <li className="active"><h6 className="fs-16">View All</h6></li>
                  <li><h6 className="fs-16">Metaverse</h6></li>
                  <li><h6 className="fs-16">Entertainment</h6></li>
                  <li><h6 className="fs-16">Energy</h6></li>
                  <li><h6 className="fs-16">NFT</h6></li>
                  <li><h6 className="fs-16">Gaming</h6></li>
                  <li><h6 className="fs-16">Music</h6></li>
                </ul>

                <div className="content-tab">
                  <div className="content-inner">
                    <table className="table">
                      <thead>
                        <tr>
                          <th></th><th>#</th><th>Name</th><th>Last Price</th><th>24h %</th><th>Market Cap</th><th>Last 7 Days</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th><span className="icon-star"></span></th>
                          <td>1</td>
                          <td>
                            <a href="#"><span className="icon-btc"><span className="path1"></span><span className="path2"></span></span> Bitcoin <span className="unit">BTC</span></a>
                          </td>
                          <td className="boild">$56,623.54</td>
                          <td className="up">+1.45%</td>
                          <td className="boild">$880,423,640,582</td>
                          <td><div id="total-revenue-chart-45" /></td>
                          <td><a href="#" className="btn">Trade</a></td>
                        </tr>
                        {/* replicate other rows from original file */}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}