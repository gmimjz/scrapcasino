"use client";

import { UserResponse } from "../client/api";
import { useUser } from "../queries/useUser";

type Props = {
  initialUser: UserResponse | null;
  children: React.ReactNode;
};

export const UserProvider = ({ initialUser, children }: Props) => {
  useUser(initialUser);

  return <>{children}</>;
};
