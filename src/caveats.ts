import { JsonRpcMiddleware } from 'json-rpc-engine';
import { isSubset } from './@types/is-subset';
import { IOcapLdCaveat } from './@types/ocap-ld'
import { unauthorized } from './errors';
const isSubset = require('is-subset');

export type ICaveatFunction = JsonRpcMiddleware;

export type ICaveatFunctionGenerator = (caveat:IOcapLdCaveat) => ICaveatFunction;

/*
 * Require that the request params match those specified by the caveat value.
 */
export const requireParams: ICaveatFunctionGenerator = function requireParams(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (req, res, next, end) => {
    const permitted = isSubset(req.params, value);

    if (!permitted) {
      res.error = unauthorized({ data: req });
      return end(res.error);
    }

    next();
  }
}

/*
 * Filters array results shallowly.
 */
export const filterResponse: ICaveatFunctionGenerator = function filterResponse(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (_req, res, next, _end) => {

    next((done) => {
      if (Array.isArray(res.result)) {
        res.result = res.result.filter((item) => {
          return value.includes(item);
        })
      }
      done();
    });
  }
}

/*
 * Forces the method to be called with given params.
 */
export const forceParams: ICaveatFunctionGenerator = function forceParams(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (req, _, next) => {
      req.params = [ ...value ]
      next();
  };
}
