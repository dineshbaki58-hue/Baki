import {
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  GET_USER_STATS_SUCCESS,
  CLEAR_USER_ERRORS
} from '../actions/userActions';

const initialState = {
  profile: null,
  stats: null,
  isLoading: false,
  error: null
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        profile: action.payload,
        isLoading: false,
        error: null
      };

    case UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case GET_USER_STATS_SUCCESS:
      return {
        ...state,
        stats: action.payload
      };

    case CLEAR_USER_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default userReducer;