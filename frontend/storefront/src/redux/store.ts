import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Importar reducers
import cartReducer from './cartSlice';

// Os reducers agora são importados de seus respectivos arquivos

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
