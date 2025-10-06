import {
  GET_WORKOUTS_REQUEST,
  GET_WORKOUTS_SUCCESS,
  GET_WORKOUTS_FAILURE,
  GET_FEATURED_WORKOUTS_SUCCESS,
  GET_WORKOUT_SUCCESS,
  RATE_WORKOUT_SUCCESS,
  CLEAR_WORKOUT_ERRORS
} from '../actions/workoutActions';

const initialState = {
  workouts: [],
  featuredWorkouts: [],
  currentWorkout: null,
  isLoading: false,
  error: null
};

const workoutReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_WORKOUTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case GET_WORKOUTS_SUCCESS:
      return {
        ...state,
        workouts: action.payload,
        isLoading: false,
        error: null
      };

    case GET_WORKOUTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };

    case GET_FEATURED_WORKOUTS_SUCCESS:
      return {
        ...state,
        featuredWorkouts: action.payload
      };

    case GET_WORKOUT_SUCCESS:
      return {
        ...state,
        currentWorkout: action.payload
      };

    case RATE_WORKOUT_SUCCESS:
      return {
        ...state,
        workouts: state.workouts.map(workout =>
          workout.id === action.payload.workoutId
            ? { ...workout, rating: action.payload.newRating }
            : workout
        )
      };

    case CLEAR_WORKOUT_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

export default workoutReducer;