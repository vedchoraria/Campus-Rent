import * as authService from '../services/authService.js';
import { signupSchema, loginSchema, validate } from '../utils/validation.js';

export const signup = async (req, res) => {
  try {
    const validation = validate(signupSchema, req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const data = await authService.signup(validation.data);
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in signup controller:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to sign up. Please try again later.'
    });
  }
};

export const login = async (req, res) => {
  try {
    const validation = validate(loginSchema, req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: validation.errors
      });
    }

    const data = await authService.login(validation.data);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      message: error?.message || 'Failed to log in. Please try again later.'
    });
  }
};
