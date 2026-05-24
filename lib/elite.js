const fs = require('fs');
  const path = require('path');

  let eliteNumbers = [
    '84821829247101',
    '241515204997176'
  ];

  const extractPureNumber = (jid) => {
    return jid.toString().replace(/[@:].*/g, '');
  };

  const isElite = (number) => {
    if (!number) return false;
    const pureNumber = extractPureNumber(number);
    return eliteNumbers.includes(pureNumber);
  };

  const addEliteNumber = (number) => {
    const pure = extractPureNumber(number);
    if (!eliteNumbers.includes(pure)) eliteNumbers.push(pure);
  };

  const removeEliteNumber = (number) => {
    const pure = extractPureNumber(number);
    const idx = eliteNumbers.indexOf(pure);
    if (idx > -1) eliteNumbers.splice(idx, 1);
  };

  module.exports = { eliteNumbers, extractPureNumber, isElite, addEliteNumber, removeEliteNumber };
  