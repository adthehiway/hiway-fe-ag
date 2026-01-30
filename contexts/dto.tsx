"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type DtoProviderProps = {
  children: ReactNode;
};

type DtoType = {
  email: string;
};

type DtoContext = {
  setData: Dispatch<SetStateAction<DtoType>>;
  data: DtoType;
};

export function DtoProvider({ children }: DtoProviderProps) {
  const [data, setData] = useState<DtoType>({
    email: "",
  });

  return (
    <DtoContext.Provider
      value={{
        setData,
        data,
      }}
    >
      {children}
    </DtoContext.Provider>
  );
}

export const DtoContext = createContext({} as DtoContext);

export function useDto() {
  return useContext(DtoContext);
}
