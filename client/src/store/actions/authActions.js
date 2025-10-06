import { authAPI } from '../../services/api';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export const LOGOUT = 'LOGOUT';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const response = await authAPI.login(email, password);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        user: response.user,
        token: response.token
      }
    });

    return { success: true };
  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.message || 'Login failed'
    });
    return { success: false, error: error.message };
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: REGISTER_REQUEST });

    const response = await authAPI.register(userData);
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: {
        user: response.user,
        token: response.token
      }
    });

    return { success: true };
  } catch (error) {
    dispatch({
      type: REGISTER_FAILURE,
      payload: error.message || 'Registration failed'
    });
    return { success: false, error: error.message };
  }
};

export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
};

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};