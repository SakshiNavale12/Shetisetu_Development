const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      mobile: Joi.string().pattern(/^[6-9]\d{9}$/).messages({
        'string.pattern.base': 'Mobile number must be 10 digits starting with 6-9',
      }),
      password: Joi.string().required().custom(password),
      name: Joi.string().required(),
      role: Joi.string().valid('farmer', 'officer', 'authority').default('farmer'),
      language: Joi.string().valid('en', 'mr', 'hi').default('mr'),
    })
    .or('email', 'mobile')
    .messages({
      'object.missing': 'Either email or mobile number is required',
    }),
};

const login = {
  body: Joi.object().keys({
    identifier: Joi.string().required().messages({
      'any.required': 'Email or mobile number is required',
    }),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
