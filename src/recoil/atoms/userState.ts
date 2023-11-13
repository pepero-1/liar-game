import { atom } from "recoil";

export interface UserState {
  id: string;
  isLoggedIn: boolean;
}

export const userState = atom<UserState>({
  key: "userState",
  default: {
    id: "",
    isLoggedIn: false,
  },
});