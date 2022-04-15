const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class TokenError extends Error {
  constructor(message) {
    super(message);
    // Remove the construction of the exception class from the stack trace
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

async function getPrivateKey() {
  const filePath = path.join(__dirname, '../../', 'ec512-key-pair.pem');
  if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
    throw Error(`Unable to read key file at: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

async function verifyToken(req, res, next) {
  const authorizationHeader = req.get('Authorization');
  if (authorizationHeader) {
    if (authorizationHeader.length >= 7) {
      // Strip "Bearer " off the front of the header
      const token = req.get('Authorization').substring(7);
      try {
        const decodedPayload = await JWT.verify(token, await getPrivateKey(), { algorithms: ['ES512'] });
        if (decodedPayload) {
          req.token = decodedPayload;
          res.locals.roles = decodedPayload?.roles ?? [];
          next();
        } else {
          res.status(401).json('Invalid decoded payload');
        }
      } catch (error) {
        res.status(401).json('Token verification failure');
      }
    } else {
      res.status(401).json('Invalid auth token');
    }
  } else {
    res.status(401).json('Invalid Auth header');
  }
}

// async function userIsAdmin(userID) {
//   try {
//     const adminGroup = await GROUP_MODEL.findOne({ groupName: 'super_admins' }).select('_id');
//     const userGroups = await MEMBERSHIP_MODEL.find({ userId: userID }).select('groupId -_id');
//     const userGroupsProcessed = [];
//     userGroups.forEach((userGroup) => {
//       userGroupsProcessed.push(userGroup.groupId.toString());
//     });

//     if (userGroupsProcessed.includes(adminGroup._id.toString())) {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     return false;
//   }
// }

async function signToken(userID, username) {
  try {
    const payload = { userID };
    payload.isAdmin = false;
    payload.username = username;
    const token = JWT.sign(payload, await getPrivateKey(), { algorithm: 'ES512', expiresIn: '2h' });
    return { username, JWT: token, isAdmin: payload.isAdmin };
  } catch (error) {
    // Throw a new exception, the caller really needs to decide what to do
    // if we can't sign the token
    throw new TokenError('Token signing failure');
  }
}

module.exports = { signToken, verifyToken };
