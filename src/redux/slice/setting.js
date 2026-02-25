import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isLoading: false,
    error: null,
}
const slice = createSlice({
    name: 'setting',
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

    }
});
export default slice.reducer;
export const { setThemeMode, setLanguage } = slice.actions;
