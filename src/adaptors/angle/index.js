const utils = require('../utils');

const networks = {
  1: 'Ethereum',
  137: 'Polygon',
  501404: 'Solana',
  122: 'Fuse',
  250: 'Fantom',
};

let symbol;
const getPoolsData = async () => {
  const apyData = await utils.getData('https://api.angle.money//v1/incentives');

  const result = [];
  for (const staking of Object.keys(apyData)) {
    // the identifier is the voting gauge address and not the address of the staking pool
    if (apyData[staking].deprecated) continue;
    // changing the symbols so they fit the Defillama framework
    symbol = apyData[staking]?.name.replace('/', '-').split(' ');
    // san token symbols
    if (symbol.length == 1) {
      symbol = symbol[0].replace('san', '').split('_')[0];
      // perp token symbols (keep as is)
    } else if (symbol.length == 2) {
      symbol = symbol[0] + ' ' + symbol[1];
      // LP token symbols
    } else {
      symbol = symbol[1] + ' ' + symbol[2];
    }

    const pool = {
      pool: `${apyData[staking]?.address}-angle`, // address of the staking pool
      chain: networks[apyData[staking]?.network] || 'Other',
      project: 'angle',
      symbol: symbol,
      tvlUsd: apyData[staking]?.tvl || 0,
      apyBase:
        apyData[staking]['apr']?.value ||
        apyData[staking]['apr']?.details['ANGLE - Tight range (+- 1%)'] ||
        0,
    };
    result.push(pool);
  }

  return result.filter((p) => p.chain !== 'Other');
};

module.exports = {
  timetravel: false,
  apy: getPoolsData,
  url: 'https://app.angle.money/#/earn',
};
