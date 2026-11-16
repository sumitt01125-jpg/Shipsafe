import {
  registerUser,
  loginUser,
  getCurrentUser,
  deleteUserAccount,
} from "./auth.service.js";

import { authCookieOptions } from "../../config/cookie.js";

// REGISTER
export const register = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.cookie("token", token, authCookieOptions);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.cookie("token", token, authCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
export const logout = (req, res) => {
  const { maxAge, ...clearOptions } = authCookieOptions;

  res.clearCookie("token", clearOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// GET CURRENT USER
export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ACCOUNT
export const deleteAccount = async (req, res, next) => {
  try {
    await deleteUserAccount(req.user.id);

    const { maxAge, ...clearOptions } = authCookieOptions;

    res.clearCookie("token", clearOptions);

    return res.status(200).json({
      success: true,
      message: "Account permanently deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};