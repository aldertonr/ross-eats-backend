/* eslint-disable no-shadow */

const methods = (methods = ['GET']) => (req, res) => {
  // Function to handle sending back a 405 error where a given method isn't allowed on an endpoint
  // Set the Allow header
  // See https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.4.6
  res.set('Allow', methods.join(', '));

  // Send the status code and a sensible error message
  res.status(405).json(`The ${req.method} method for the "${req.originalUrl}" route is not supported.`);
};

module.exports = methods;
