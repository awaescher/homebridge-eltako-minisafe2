import {expect} from 'chai';
import {MiniSafe2Api} from '../MiniSafe2Api';

describe('MiniSafe2Api related tests', () => {
  describe('buildUrl related tests', () => {
    it('should authenticate with XC_PASS only when no username is set', () => {
      const api = new MiniSafe2Api('192.168.1.2', 'secret', '');
      const url = api.buildUrl('/cmd?XC_FNC=GetStates');
      expect(url).to.equal('http://192.168.1.2/cmd?XC_FNC=GetStates&XC_PASS=secret');
    });

    it('should prepend XC_USER when a username is set', () => {
      const api = new MiniSafe2Api('192.168.1.2', 'secret', '', 'user@example.com');
      const url = api.buildUrl('/cmd?XC_FNC=GetStates');
      expect(url).to.equal('http://192.168.1.2/cmd?XC_FNC=GetStates&XC_USER=user%40example.com&XC_PASS=secret');
    });

    it('should url-encode special characters in the password', () => {
      const api = new MiniSafe2Api('192.168.1.2', 'p@ss wort', '');
      const url = api.buildUrl('/info');
      expect(url).to.equal('http://192.168.1.2/info?XC_PASS=p%40ss%20wort');
    });

    it('should url-encode the access token', () => {
      const api = new MiniSafe2Api('192.168.1.2', '', 'tok/en+1');
      const url = api.buildUrl('/info');
      expect(url).to.equal('http://192.168.1.2/info?at=tok%2Fen%2B1');
    });

    it('should use ? as separator for routes without a query string', () => {
      const api = new MiniSafe2Api('192.168.1.2', 'secret', '', 'user@example.com');
      const url = api.buildUrl('/info');
      expect(url).to.equal('http://192.168.1.2/info?XC_USER=user%40example.com&XC_PASS=secret');
    });
  });
});
