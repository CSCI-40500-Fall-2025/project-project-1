import { create } from "zustand";

// 1. Define your state shape
type FormState = {
  // Basic form fields
  loggedIn: boolean;
  name: string;
  accountNumber: string;
  userName: string;
  password: string
  friendGroups: string[];
  email: string;
};

// 2. Define your actions
type FormActions = {
  // Basic setters
  setLoggedIn: (loggedIn: boolean) => void;
  setName: (name: string) => void;
  setAccountNumber: (accountNumber: string) => void;
  setUserName: (userName: string) => void;
  setPassword: (password: string) => void;
  setFriendGroups: (friendGroups: string[]) => void;
  setEmail: (email: string) => void;

  // Complex actions
  reset: () => void;
};

// 3. Combine state and actions
type FormStore = FormState & FormActions;

// 4. Define initial state
const initialState: FormState = {
  loggedIn: false,
  name: "",
  accountNumber: "",
  userName: "",
  password: "",
  friendGroups: [],
  email: "",
};

// 5. Create the store
export const useFormStore = create<FormStore>((set) => ({
  ...initialState,

  setLoggedIn: (loggedIn) => set({ loggedIn }),
  setName: (name) => set({ name }),
  setAccountNumber: (accountNumber) => set({ accountNumber }),
  setUserName: (userName) => set({ userName }),
  setPassword: (password) => set({ password }),
  setFriendGroups: (friendGroups) => set({ friendGroups }),
  setEmail: (email) => set({ email }),

  reset: () => set(initialState),
}));

// 6. Custom hook for computed values (example: check if all fields are filled)
export const useFormData = () => {
  const loggedIn = useFormStore((state) => state.loggedIn);
  const name = useFormStore((state) => state.name);
  const accountNumber = useFormStore((state) => state.accountNumber);
  const userName = useFormStore((state) => state.userName);
  const password = useFormStore((state) => state.password);
  const friendGroups = useFormStore((state) => state.friendGroups);
  const email = useFormStore((state) => state.email);

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
