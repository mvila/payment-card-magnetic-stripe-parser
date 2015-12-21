'use strict';

import { assert } from 'chai';
import { parsePaymentCardMagneticStripe } from './src';

describe('parsePaymentCardMagneticStripe()', function() {
  it('should work with IATA format', function() {
    let result = parsePaymentCardMagneticStripe('%B1234123412341234^DUPONT/JEAN.MR^1709701000000000000000286000000?');
    assert.lengthOf(result.cards, 1);
    assert.equal(result.cards[0].number, '1234123412341234');
    assert.equal(result.cards[0].expirationDate, '2017-09');
    assert.deepEqual(result.cards[0].holder, { firstName: 'JEAN', lastName: 'DUPONT', title: 'MR' });
    assert.lengthOf(result.errors, 0);
  });

  it('should work with ABA format', function() {
    let result = parsePaymentCardMagneticStripe(';1234123412341234=17092017370374292421?');
    assert.lengthOf(result.cards, 1);
    assert.equal(result.cards[0].number, '1234123412341234');
    assert.equal(result.cards[0].expirationDate, '2017-09');
    assert.deepEqual(result.cards[0].holder, { firstName: '', lastName: '', title: '' });
    assert.lengthOf(result.errors, 0);
  });

  it('should work with multiple tracks', function() {
    let result = parsePaymentCardMagneticStripe('%B1234123412341234^DUPONT/JEAN.MR^1709701000000000000000286000000?\r;1234123412341234=17092017370374292421?');
    assert.lengthOf(result.cards, 2);
    assert.equal(result.cards[0].number, '1234123412341234');
    assert.equal(result.cards[0].expirationDate, '2017-09');
    assert.deepEqual(result.cards[0].holder, { firstName: 'JEAN', lastName: 'DUPONT', title: 'MR' });
    assert.equal(result.cards[1].number, '1234123412341234');
    assert.equal(result.cards[1].expirationDate, '2017-09');
    assert.deepEqual(result.cards[1].holder, { firstName: '', lastName: '', title: '' });
    assert.lengthOf(result.errors, 0);
  });

  it('should return errors if something is wrong', function() {
    let result;

    result = parsePaymentCardMagneticStripe(undefined);
    assert.lengthOf(result.cards, 0);
    assert(result.errors.length > 0);

    result = parsePaymentCardMagneticStripe('%B1234123412341234');
    assert.lengthOf(result.cards, 0);
    assert(result.errors.length > 0);
  });

  it('can return both a card and errors', function() {
    let result = parsePaymentCardMagneticStripe('%B1234123412341234^DUPONT/JEAN.MR^1799701000000000000000286000000?\r;1234123412341234=17092017370374292421?');
    assert.lengthOf(result.cards, 1);
    assert.equal(result.cards[0].number, '1234123412341234');
    assert.equal(result.cards[0].expirationDate, '2017-09');
    assert.deepEqual(result.cards[0].holder, { firstName: '', lastName: '', title: '' });
    assert(result.errors.length > 0);
  });
});
