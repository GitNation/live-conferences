const crypto = require('crypto');

exports.verify = ({ signature, secret, timestamp, rawBody, ver = 'v0' }) => {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    const checking = `${ver}:${timestamp}:${rawBody}`;
    hmac.update(checking);
    const hex = hmac.digest('hex');
    const isSame = `${ver}=${hex}` === signature;
    if (!isSame) {
      throw true;
    }
  } catch (err) {
    console.error(err);
    throw new Error('Incorrect signature');
  }
};
