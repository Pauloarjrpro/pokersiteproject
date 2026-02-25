import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isLoading: false,
    error: null,
    cards:[],

}
const slice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // START LOADING
        startLoading(state) {
            state.isLoading = true;
        },
        
        hasError(state, action) {
            state.isLoading = false;
            state.error = action.payload;
        },
        setCards(state, action){
            state.cards = action.payload;
        }
    }
});
export default slice.reducer;
export const { setCards } = slice.actions;
