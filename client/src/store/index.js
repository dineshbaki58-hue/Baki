import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';

// Reducers
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';
import workoutReducer from './reducers/workoutReducer';
import nutritionReducer from './reducers/nutritionReducer';
import progressReducer from './reducers/progressReducer';
import subscriptionReducer from './reducers/subscriptionReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user']
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  workouts: workoutReducer,
  nutrition: nutritionReducer,
  progress: progressReducer,
  subscription: subscriptionReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);