import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Reducers serão importados aqui quando implementados
// import cartReducer from './features/cart/cartSlice';

// Temporary reducer até que os slices sejam implementados
const cartReducer = (state = { items: [], total: 0, quantity: 0 }, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // Outros reducers serão adicionados aqui
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
