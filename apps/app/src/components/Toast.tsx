import { ToastStatus } from "../utils/enums";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { twMerge } from "tailwind-merge";

type Props = {
  message?: string;
  status?: ToastStatus;
};

export const Toast = ({ message, status }: Props) => {
  return (
    <div className="h-16 bg-black text-sm">
      <div
        className={twMerge(
          "flex h-full w-full items-center justify-center gap-2 bg-white/10 px-6 text-white",
          status === ToastStatus.Success && "text-green",
          status === ToastStatus.Error && "text-red",
        )}
      >
        {status === ToastStatus.Error && (
          <FaExclamationTriangle className="size-4" />
        )}
        {status === ToastStatus.Success && <FaCheckCircle className="size-4" />}
        {status === ToastStatus.Info && <FaInfoCircle className="size-4" />}
        {message}
      </div>
    </div>
  );
};
