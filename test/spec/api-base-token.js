/* global USER_AGENT, fetch */

import util from '@okta/test.support/util';
import { OktaAuth } from '@okta/okta-auth-js';
import tokens from '@okta/test.support/tokens';
import oauthUtil from '@okta/test.support/oauthUtil';

const _ = require('lodash');

describe('base token API', function() {

  function createOktaAuth(options = {}) {
    return new OktaAuth(Object.assign({
      issuer: tokens.ISSUER,
      storageManager: {
        cache: {
          storageType: 'memory'
        }
      }
    }, options));
  }
  describe('prepareTokenParams', function() {
    let oktaAuth;

    beforeEach(() => {
      util.warpToUnixTime(oauthUtil.getTime());
    });

    describe('pkce', () => {
      beforeEach(() => {
        oktaAuth = createOktaAuth({ pkce: true });
        oauthUtil.loadWellKnownAndKeysCache(oktaAuth);
      });
      it('can be called with no parameters', async () => {
        const params = await oktaAuth.token.prepareTokenParams();
        expect(params).toEqual({
          'pkce': true,
          'redirectUri': 'http://localhost/',
          'responseType': 'code',
          'state': expect.any(String),
          'nonce': expect.any(String),
          'scopes': [
            'openid',
            'email'
          ],
          'codeChallengeMethod': 'S256',
          'codeVerifier': expect.any(String),
          'codeChallenge': expect.any(String),
          'ignoreSignature': false
        });
      });
    });
    describe('not pkce', () => {
      beforeEach(() => {
        oktaAuth = createOktaAuth({ pkce: false });
        oauthUtil.loadWellKnownAndKeysCache(oktaAuth);
      });
      it('can be called with no parameters', async () => {
        const params = await oktaAuth.token.prepareTokenParams();
        expect(params).toEqual({
          'ignoreSignature': false,
          'pkce': false,
          'redirectUri': 'http://localhost/',
          'responseType': [
            'token',
            'id_token'
          ],
          'state': expect.any(String),
          'nonce': expect.any(String),
          'scopes': [
            'openid',
            'email'
          ]
        });
      });
    });

  });

  describe('exchangeCodeForTokens', function() {
    var ISSUER = tokens.ISSUER;
    var REDIRECT_URI = 'http://fake.local';
    var CLIENT_ID = tokens.standardIdTokenParsed.clientId;
    var endpoint = '/oauth2/v1/token';
    var codeVerifier = 'superfake';
    var authorizationCode = 'notreal';
    var interactionCode = 'definitelynotreal';
    var setup = {
      issuer: ISSUER,
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      pkce: true,
      calls: [
        {
          request: {
            method: 'post',
            uri: endpoint,
            withCredentials: false,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/x-www-form-urlencoded',
              'X-Okta-User-Agent-Extended': USER_AGENT
            }
          },
          response: 'pkce-token-success',
          responseVars: {
            scope: 'ignored in this test',
            accessToken: tokens.standardAccessToken,
            idToken: tokens.standardIdToken
          }
        }
      ]
    };

    beforeEach(() => {
      util.warpToUnixTime(oauthUtil.getTime());
    });

    util.itMakesCorrectRequestResponse({
      title: 'requests a token using authorizationCode',
      setup: _.cloneDeep(setup),
      execute: function (test) {
        oauthUtil.loadWellKnownAndKeysCache(test.oa);
        return test.oa.token.exchangeCodeForTokens({
          authorizationCode,
          codeVerifier,
        });
      },
      expectations: function () {
        expect(fetch).toHaveBeenCalledTimes(1);
        const args = fetch.mock.calls[0][1];
        const params = util.parseQueryParams(args.body); // decode form body
        expect(params).toEqual(    {
          'client_id': CLIENT_ID,
          'redirect_uri': REDIRECT_URI,
          'grant_type': 'authorization_code',
          'code_verifier': 'superfake',
          'code': 'notreal'
        });
      }
    });

    util.itMakesCorrectRequestResponse({
      title: 'requests a token using interactionCode',
      setup: _.cloneDeep(setup),
      execute: function (test) {
        oauthUtil.loadWellKnownAndKeysCache(test.oa);
        return test.oa.token.exchangeCodeForTokens({
          interactionCode,
          codeVerifier,
        });
      },
      expectations: function () {
        expect(fetch).toHaveBeenCalledTimes(1);
        const args = fetch.mock.calls[0][1];
        const params = util.parseQueryParams(args.body); // decode form body
        expect(params).toEqual(    {
          'client_id': CLIENT_ID,
          'redirect_uri': REDIRECT_URI,
          'grant_type': 'interaction_code',
          'code_verifier': 'superfake',
          'interaction_code': 'definitelynotreal'
        });
      }
    });
  });
});