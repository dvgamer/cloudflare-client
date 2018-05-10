'use strict';

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _consola = require('consola');

var _consola2 = _interopRequireDefault(_consola);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// import { CronJob } from 'cron'

var dev = process.env.NODE_ENV !== 'production';
var debug = {
  log: function log() {
    var _console;

    if (!dev) return;

    for (var _len = arguments.length, msg = Array(_len), _key = 0; _key < _len; _key++) {
      msg[_key] = arguments[_key];
    }

    (_console = console).log.apply(_console, [' '].concat(_toConsumableArray(msg)));
  },
  start: function start() {
    if (!dev) return;

    for (var _len2 = arguments.length, msg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      msg[_key2] = arguments[_key2];
    }

    _consola2.default.start(msg.join(' '));
  },
  success: function success() {
    if (!dev) return;

    for (var _len3 = arguments.length, msg = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      msg[_key3] = arguments[_key3];
    }

    _consola2.default.success(msg.join(' '));
  },
  info: function info() {
    if (!dev) return;

    for (var _len4 = arguments.length, msg = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      msg[_key4] = arguments[_key4];
    }

    _consola2.default.info(msg.join(' '));
  },
  error: function error() {
    if (!dev) return;

    for (var _len5 = arguments.length, msg = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      msg[_key5] = arguments[_key5];
    }

    _consola2.default.error(msg.join(' '));
  }
};

if (!process.env.DOMAIN_NAME) throw new Error('Required \'DOMAIN_NAME\' environment.');
if (!process.env.DOMAIN_ZONE) throw new Error('Required \'DOMAIN_ZONE\' environment.');
var getRecords = null;

var ipAddrUpdate = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(domain) {
    var api, zone, headers, endpointPutRecords, putRecords;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _requestPromise2.default)({
              url: 'https://api.ipify.org?format=json',
              json: true
            });

          case 2:
            api = _context.sent;

            if (process.env.DOMAIN_KEY) {
              _context.next = 5;
              break;
            }

            throw new Error('Required \'DOMAIN_KEY\' environment.');

          case 5:
            if (process.env.DOMAIN_EMAIL) {
              _context.next = 7;
              break;
            }

            throw new Error('Required \'DOMAIN_EMAIL\' environment.');

          case 7:
            zone = process.env.DOMAIN_ZONE;
            headers = {
              'Content-Type': 'application/json',
              'X-Auth-Key': process.env.DOMAIN_KEY.trim(),
              'X-Auth-Email': process.env.DOMAIN_EMAIL.trim()
            };

            debug.start('[cloudflare.com]', 'My IP Address: ' + api.ip);

            if (!(!getRecords || !getRecords.success)) {
              _context.next = 18;
              break;
            }

            _context.next = 13;
            return (0, _requestPromise2.default)({
              url: 'https://api.cloudflare.com/client/v4/zones/' + zone + '/dns_records?name=' + domain,
              headers: headers,
              timeout: 1000,
              json: true
            });

          case 13:
            getRecords = _context.sent;


            debug[getRecords.success ? 'success' : 'error']('[cloudflare.com]', 'DNS Verify ' + (getRecords.success ? 'Pass' : 'Fail') + '.');

            if (getRecords.success) {
              _context.next = 17;
              break;
            }

            throw new Error('Not found record name \'' + domain + '\'');

          case 17:
            getRecords = getRecords.result[0];

          case 18:
            debug.log('[cloudflare.com]', 'DNS: ' + getRecords.content + ' ' + (api.ip !== getRecords.content ? 'Updating...' : 'Ignore') + '.');
            endpointPutRecords = 'https://api.cloudflare.com/client/v4/zones/' + zone.trim() + '/dns_records/' + getRecords.id;

            if (!(api.ip !== getRecords.content)) {
              _context.next = 29;
              break;
            }

            _context.next = 23;
            return (0, _requestPromise2.default)({
              method: 'PUT',
              url: endpointPutRecords,
              headers: headers,
              body: { type: getRecords.type, name: domain, content: '171.6.26.242' },
              json: true
            });

          case 23:
            putRecords = _context.sent;

            debug[putRecords.success ? 'success' : 'error']('[cloudflare.com]', 'DNS Updated ' + (putRecords.success ? 'Pass' : 'Fail') + '.');

            if (putRecords.success) {
              _context.next = 27;
              break;
            }

            throw new Error('Can\'t PUT record name \'' + domain + '\'');

          case 27:
            getRecords.content = api.ip;
            debug.log('[couldfare.com]', 'DNS: \'' + domain + '\' IP:\'' + api.ip + '\' Updated at ' + (0, _moment2.default)().format('YYYY-MM-DD HH:mm:ss') + '.');

          case 29:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function ipAddrUpdate(_x) {
    return _ref.apply(this, arguments);
  };
}();

ipAddrUpdate(process.env.DOMAIN_NAME).catch(debug.error);
// let jobUpdated = new CronJob({
//   cronTime: '30 * * * *',
//   onTick: () => { ipAddrUpdate(process.env.DOMAIN_NAME).catch(debug.error) },
//   start: true,
//   timeZone: 'Asia/Bangkok'
// })

// console.log(`[couldfare.com] Watch and updated '${process.env.DOMAIN_NAME}' ${jobUpdated.running ? 'started' : 'stoped'}.`)
