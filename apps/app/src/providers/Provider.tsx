"use client";

import { UserResponse } from "../client/api";
import { QueryProvider } from "./QueryProvider";
import { UserProvider } from "./UserProvider";

type Props = {
  initialUser: UserResponse | null;
  children: React.ReactNode;
};

export const Provider = ({ initialUser, children }: Props) => {
  return (
    <QueryProvider>
      <UserProvider initialUser={initialUser}>{children}</UserProvider>
    </QueryProvider>
  );
};
