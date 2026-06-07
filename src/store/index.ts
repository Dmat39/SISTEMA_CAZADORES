import { configureStore, Reducer } from '@reduxjs/toolkit';
import authReducer, { AuthState } from './slices/authSlice';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

const parseStateIfString =
  (reducer: Reducer<AuthState>) =>
  (state: AuthState | string | undefined, action: any): AuthState => {
    if (typeof state === 'string') {
      try {
        const parsed = JSON.parse(state);
        return reducer(parsed, action);
      } catch {
        return reducer(undefined, action);
      }
    }
    return reducer(state as AuthState | undefined, action);
  };

const rootReducer = combineReducers({
  auth: parseStateIfString(authReducer),
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedReducer = persistReducer(
  {
    key: 'root',
    storage,
    whitelist: ['auth'],
    transforms: [
      {
        in: (inboundState: AuthState) => ({
          token: inboundState.token,
          username: inboundState.username,
          id: inboundState.id,
          role: inboundState.role,
          authorized: inboundState.authorized,
        }),
        out: (outboundState: AuthState) => outboundState,
      },
    ],
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
