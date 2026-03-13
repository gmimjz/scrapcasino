import { PartialUserResponse } from "../client/api";
import { create } from "zustand";

interface UsersState {
  users: PartialUserResponse[];
  setUsers: (users: PartialUserResponse[]) => void;
  updateUser: (
    userId: string,
    updatedUser: Partial<PartialUserResponse>,
  ) => void;
  addUser: (newUser: PartialUserResponse) => void;
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  setUsers: (users) => set((state) => ({ ...state, users })),
  updateUser: (userId, updatedUser) =>
    set((state) => {
      const users = state.users;
      const newUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, ...updatedUser };
        }

        return user;
      });

      return { ...state, users: newUsers };
    }),
  addUser: (newUser) =>
    set((state) => {
      const users = state.users;
      let found = false;

      const newUsers = users.map((user) => {
        if (user.id === newUser.id) {
          found = true;
          return { ...user, ...newUser };
        }

        return user;
      });

      if (!found) {
        newUsers.push(newUser);
      }

      return { ...state, users: newUsers };
    }),
}));
