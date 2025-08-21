import { configureStore } from "@reduxjs/toolkit";
import { reducer } from "./appSlice";

export const store = configureStore({ reducer: { app: reducer } });
