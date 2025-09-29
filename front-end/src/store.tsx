import { create } from "zustand";
import type { User } from "./const";

type FormState = {
  loggedIn: boolean;
  user: User | null;
  password: string;
  friendGroups: string[];
};


type FormActions = {
  // Basic setters
  setLoggedIn: (loggedIn: boolean) => void;
  setUser: (user: User | null) => void;
  setPassword: (password: string) => void;
  setFriendGroups: (friendGroups: string[]) => void;
};


type FormStore = FormState & FormActions;


const initialState: FormState = {
  loggedIn: false,
  user: null,
  password: "",
  friendGroups: [],
};

// 5. Create the store
export const useFormStore = create<FormStore>((set) => ({
  ...initialState,

  setLoggedIn: (loggedIn) => set({ loggedIn }),
  setUser: (user) => set({ user }),
  setPassword: (password) => set({ password }),
  setFriendGroups: (friendGroups) => set({ friendGroups }),
  reset: () => set(initialState),
}));

// 6. Custom hook for computed values (example: check if all fields are filled)
export const useFormData = () => {
  const loggedIn = useFormStore((state) => state.loggedIn);
  const email = useFormStore((state) => state.user?.email || "");
  const accountNumber = useFormStore((state) => state.user?.userID || 0);
  const userName = useFormStore((state) => state.user?.userName || "");
  const password = useFormStore((state) => state.password);
  const friendGroups = useFormStore((state) => state.friendGroups);


  return {
    loggedIn,
    name,
    accountNumber,
    userName,
    password,
    friendGroups,
    email,
  };
};
