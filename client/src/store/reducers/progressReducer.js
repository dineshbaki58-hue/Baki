import {
  LOG_PROGRESS_REQUEST,
  LOG_PROGRESS_SUCCESS,
  LOG_PROGRESS_FAILURE,
  GET_PROGRESS_REQUEST,
  GET_PROGRESS_SUCCESS,
  GET_PROGRESS_FAILURE,
  GET_PROGRESS_ANALYTICS_SUCCESS,
  CLEAR_PROGRESS_ERRORS
} from '../actions/progressActions';

const initialState = {
  entries: [],
  analytics: null,
  isLoading: false,
  isLogging: false,
  error: null
};

const progressReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOG_PROGRESS_REQUEST:
      return {
        ...state,
        isLogging: true,
        error: null
      };

    case GET_PROGRESS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case LOG_PROGRESS_SUCCESS:
      return {
        ...state,
        entries: [action.payload, ...state.entries],
        isLogging: false,
        error: null
      };

    case GET_PROGRESS_SUCCESS:
      return {
        ...state,
        entries: action.payload,
        isLoading: false,
        error: null
      };

    case GET_PROGRESS_ANALYTICS_SUCCESS:
      return {
        ...state,
        analytics: action.payload
      };

    case LOG_PROGRESS_FAILURE:
    case GET_PROGRESS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isLogging: false,
        error: action.payload
      };

    case CLEAR_PROGRESS_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default progressReducer;