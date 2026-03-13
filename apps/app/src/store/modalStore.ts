import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set((state) => ({ ...state, isOpen })),
}));
