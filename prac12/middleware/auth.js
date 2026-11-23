module.exports = function (req, res, next) {
  if (!req.session.username) return res.status(401).json({ message: 'Please login first.' });
  next();
};
