import { createSlice } from '@reduxjs/toolkit';

const refreshSlice = createSlice({
    name: 'refresh',
    initialState: {
        mustRefresh: false
    },
    reducers: {
        triggerRefresh: (state) => {
            state.mustRefresh = !state.mustRefresh;
        }
    }
});

export const { triggerRefresh } = refreshSlice.actions;
export default refreshSlice.reducer; 