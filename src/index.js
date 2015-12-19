'use strict';

import { AbstractDate } from 'abstract-date';

export function parsePaymentCardMagneticStripe(data = '') {
  let cards = [];
  let errors = [];
  let tracks = data.split('\r');
  for (let track of tracks) {
    if (!track) continue;
    let result = parseTrack(track);
    if (result.card) cards.push(result.card);
    if (result.error) errors.push(result.error);
  }
  if (!cards.length) errors.push(new Error('No card information found'));
  return { cards, errors };
}

function parseTrack(track) {
  try {
    let number, expirationDate, holder;
    if (track.startsWith('%B')) { // IATA format
      // Ex.: %B1234123412341234^DUPONT/JEAN.MR^1709701000000000000000286000000?
      track = track.slice(2);
      let parts = track.split('^');
      if (parts.length !== 3) throw new Error('Invalid track');
      number = parseNumber(parts[0]);
      expirationDate = parseExpirationDate(parts[2]);
      holder = parseHolder(parts[1]);
    } else if (track.startsWith(';')) { // ABA format
      // Ex.: ;1234123412341234=17092017370374292421?
      track = track.slice(1);
      let parts = track.split('=');
      if (parts.length !== 2) throw new Error('Invalid track');
      number = parseNumber(parts[0]);
      expirationDate = parseExpirationDate(parts[1]);
      holder = parseHolder('');
    }
    return { card: { number, expirationDate, holder } };
  } catch (err) {
    return { error: err };
  }
}

function parseNumber(number) {
  if (!/^\d{10,19}$/.test(number)) {
    throw new Error('Invalid credit card number');
  }
  return number;
}

function parseExpirationDate(date) {
  date = '20' + date.slice(0, 2) + '-' + date.slice(2, 4) + '-01T00:00:00.000';
  date = new AbstractDate(date);
  return date;
}

function parseHolder(holder) {
  holder = holder.match(/^(.*)\/(.*?)(?:\.(.*))?$/) || [];
  holder = {
    firstName: (holder[2] || '').trim(),
    lastName: (holder[1] || '').trim(),
    title: (holder[3] || '').trim()
  };
  return holder;
}

export default parsePaymentCardMagneticStripe;
