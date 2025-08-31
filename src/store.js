import { configureStore, createSlice } from "@reduxjs/toolkit";

const counter = createSlice({
    name: "counter",
    initialState: { value: 0 },
    reducers: {
        inc: (s) => { s.value++; },
        dec: (s) => { s.value--; },
    },
});

export const { inc, dec } = counter.actions;

export const store = configureStore({
    reducer: { counter: counter.reducer },
});
