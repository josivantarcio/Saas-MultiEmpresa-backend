import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  quantity: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  quantity: 0
};

const calculateTotals = (items: CartItem[]) => {
  return items.reduce(
    (acc, item) => {
      return {
        total: acc.total + item.price * item.quantity,
        quantity: acc.quantity + item.quantity
      };
    },
    { total: 0, quantity: 0 }
  );
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      const { total, quantity } = calculateTotals(state.items);
      state.total = total;
      state.quantity = quantity;
    },
    
    updateCartItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
      }
      
      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.quantity = totals.quantity;
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      const { total, quantity } = calculateTotals(state.items);
      state.total = total;
      state.quantity = quantity;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.quantity = 0;
    }
  }
});

export const { addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
