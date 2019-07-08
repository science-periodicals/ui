/* eslint no-console: 0 */

import {
  Librarian,
  createId,
  getDefaultPeriodicalDigitalDocumentPermissions
} from '@scipe/librarian';
import { getId, arrayify } from '@scipe/jsonld';
import faker from 'faker';
import uuid from 'uuid';
import asyncWhilst from 'async/whilst';
import asyncEachSeries from 'async/eachSeries';
import path from 'path';
import xlsx from 'xlsx';
import isUrl from 'is-url';
import url from 'url';

const librarian = new Librarian();

const users = [];
const periodicals = getJournalData();
let count = 0;
let errCount = 0;

asyncWhilst(
  () => count < 100 && errCount < 100000,
  cb => {
    registerUser(librarian, createUser(), (err, registerAction) => {
      if (err) {
        console.error(err);
        errCount++;
      } else {
        console.log(registerAction);
        users.push(registerAction.result);
        count++;
      }
      cb(null);
    });
  },
  err => {
    if (err) {
      console.error(err);
    } else {
      console.log('user seeded');
    }

    createOrganization(librarian, users[0], (err, createOrganizationAction) => {
      if (err) return console.error(err);
      const organization = arrayify(createOrganizationAction.result).find(
        result => result['@type'] === 'Organization'
      );
      asyncEachSeries(
        periodicals,
        (periodical, cb) => {
          createPeriodical(
            librarian,
            users[0],
            organization,
            periodical,
            (err, action) => {
              if (err) {
                console.error(err);
              } else {
                console.log(action);
              }
              cb(null);
            }
          );
        },
        err => {
          if (err) {
            console.error(err);
          } else {
            console.log('journal seeded');
          }
          librarian.close();
        }
      );
    });
  }
);

function createUser() {
  const honorificPrefix = faker.name.prefix();
  const honorificSuffix = faker.name.suffix();
  const givenName = faker.name.firstName();
  const familyName = faker.name.lastName();
  return {
    '@id': `user:${faker.internet
      .userName()
      .toLowerCase()
      .replace(/\./g, '-')}`,
    '@type': 'Person',
    email: `mailto:${faker.internet.email()}`,
    name: `${honorificPrefix} ${givenName} ${familyName} ${honorificSuffix}`,
    honorificPrefix,
    honorificSuffix,
    givenName,
    familyName,
    password: faker.internet.password()
  };
}

function registerUser(librarian, user, callback) {
  const tokenId = createId('token')['@id'];

  librarian.post(
    {
      '@type': 'RegisterAction',
      actionStatus: 'ActiveActionStatus',
      agent: user,
      instrument: {
        '@type': 'Password',
        value: user.password
      }
    },
    { tokenId },
    (err, activeRegisterAction) => {
      if (err) return callback(err);
      librarian.post(
        Object.assign({}, activeRegisterAction, {
          actionStatus: 'CompletedActionStatus',
          instrument: {
            '@id': tokenId,
            '@type': 'Token',
            tokenType: 'registrationToken'
          }
        }),
        callback
      );
    }
  );
}

function createOrganization(librarian, user, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {};
  }

  librarian.post(
    {
      '@type': 'CreateOrganizationAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      result: {
        '@id': `org:${uuid.v4()}`,
        '@type': 'Organization',
        name: opts.organizationName || `Organization ${uuid.v4()}`
      }
    },
    { acl: user },
    callback
  );
}

function createPeriodical(librarian, user, organization, periodical, callback) {
  librarian.post(
    {
      '@type': 'CreatePeriodicalAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      object: getId(organization),
      result: Object.assign({}, periodical, {
        hasDigitalDocumentPermission: getDefaultPeriodicalDigitalDocumentPermissions(
          user,
          { createGraphPermission: true, publicReadPermission: true }
        )
      })
    },
    { acl: user },
    callback
  );
}

function getJournalData() {
  // Journal data
  const workbook = xlsx.readFile(path.resolve(__dirname, './data/sage.xlsx'));
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const range = xlsx.utils.decode_range(worksheet['!ref']);

  const urlCell = xlsx.utils.decode_cell('D1');
  const issnCell = xlsx.utils.decode_cell('B1');
  const titleCell = xlsx.utils.decode_cell('A1');

  const periodicals = [];
  for (let i = urlCell.r + 1; i < range.e.r; i++) {
    const tcell = worksheet[xlsx.utils.encode_cell({ c: titleCell.c, r: i })];
    const ucell = worksheet[xlsx.utils.encode_cell({ c: urlCell.c, r: i })];
    const icell = worksheet[xlsx.utils.encode_cell({ c: issnCell.c, r: i })];
    if (
      ucell &&
      ucell.v &&
      isUrl(ucell.v) &&
      tcell &&
      tcell.v &&
      icell &&
      icell.v
    ) {
      periodicals.push({
        '@id': `journal:${url.parse(ucell.v).hostname.split('.')[0]}`,
        '@type': 'Periodical',
        name: tcell.v,
        issn: icell.v
      });
    }
  }

  return periodicals;
}
