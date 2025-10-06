import {
  GET_NUTRITION_PLANS_REQUEST,
  GET_NUTRITION_PLANS_SUCCESS,
  GET_NUTRITION_PLANS_FAILURE,
  GENERATE_NUTRITION_PLAN_REQUEST,
  GENERATE_NUTRITION_PLAN_SUCCESS,
  GENERATE_NUTRITION_PLAN_FAILURE,
  GET_NUTRITION_PLAN_SUCCESS,
  UPDATE_NUTRITION_PLAN_SUCCESS,
  DELETE_NUTRITION_PLAN_SUCCESS,
  CLEAR_NUTRITION_ERRORS
} from '../actions/nutritionActions';

const initialState = {
  plans: [],
  currentPlan: null,
  isLoading: false,
  isGenerating: false,
  error: null
};

const nutritionReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NUTRITION_PLANS_REQUEST:
    case GENERATE_NUTRITION_PLAN_REQUEST:
      return {
        ...state,
        isLoading: action.type === GET_NUTRITION_PLANS_REQUEST,
        isGenerating: action.type === GENERATE_NUTRITION_PLAN_REQUEST,
        error: null
      };

    case GET_NUTRITION_PLANS_SUCCESS:
      return {
        ...state,
        plans: action.payload,
        isLoading: false,
        error: null
      };

    case GENERATE_NUTRITION_PLAN_SUCCESS:
      return {
        ...state,
        plans: [action.payload, ...state.plans],
        isGenerating: false,
        error: null
      };

    case GET_NUTRITION_PLAN_SUCCESS:
      return {
        ...state,
        currentPlan: action.payload
      };

    case UPDATE_NUTRITION_PLAN_SUCCESS:
      return {
        ...state,
        plans: state.plans.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        )
      };

    case DELETE_NUTRITION_PLAN_SUCCESS:
      return {
        ...state,
        plans: state.plans.filter(plan => plan.id !== action.payload)
      };

    case GET_NUTRITION_PLANS_FAILURE:
    case GENERATE_NUTRITION_PLAN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isGenerating: false,
        error: action.payload
      };

    case CLEAR_NUTRITION_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default nutritionReducer;