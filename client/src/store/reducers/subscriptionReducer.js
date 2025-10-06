import {
  GET_SUBSCRIPTION_STATUS_REQUEST,
  GET_SUBSCRIPTION_STATUS_SUCCESS,
  GET_SUBSCRIPTION_STATUS_FAILURE,
  CREATE_SUBSCRIPTION_REQUEST,
  CREATE_SUBSCRIPTION_SUCCESS,
  CREATE_SUBSCRIPTION_FAILURE,
  CANCEL_SUBSCRIPTION_SUCCESS,
  REACTIVATE_SUBSCRIPTION_SUCCESS,
  CLEAR_SUBSCRIPTION_ERRORS
} from '../actions/subscriptionActions';

const initialState = {
  subscription: null,
  isLoading: false,
  isProcessing: false,
  error: null
};

const subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SUBSCRIPTION_STATUS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case CREATE_SUBSCRIPTION_REQUEST:
      return {
        ...state,
        isProcessing: true,
        error: null
      };

    case GET_SUBSCRIPTION_STATUS_SUCCESS:
      return {
        ...state,
        subscription: action.payload,
        isLoading: false,
        error: null
      };

    case CREATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        subscription: action.payload,
        isProcessing: false,
        error: null
      };

    case CANCEL_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          isActive: false,
          status: 'canceled'
        }
      };

    case REACTIVATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          isActive: true,
          status: 'active'
        }
      };

    case GET_SUBSCRIPTION_STATUS_FAILURE:
    case CREATE_SUBSCRIPTION_FAILURE:
      return {
        ...state,
        isLoading: false,
        isProcessing: false,
        error: action.payload
      };

    case CLEAR_SUBSCRIPTION_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default subscriptionReducer;