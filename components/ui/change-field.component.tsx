"use client";

import { Button } from "./button";
import { Icon } from "./icons";

interface Props {
  label: string;
  scr: string;
  title: string;
  subtitle?: string;
  buttonTitle?: string;
  error?: string;
  click?: () => void;
}

export function ChangeField(props: Props) {
  return (
    <div className="w-full mb-3">
      <label className="block mb-2 font-primary text-[10px] font-extralight uppercase text-muted-foreground">
        {props.label}
      </label>
      <div
        className={`${
          props.error && "border border-destructive"
        } flex flex-row justify-between h-[62px] bg-muted rounded-lg w-full p-2.5 items-center`}
      >
        <div className="flex flex-row items-center min-w-0">
          <div className="h-[48px] w-[48px] flex-shrink-0">
            <div className="flex justify-center items-center overflow-hidden h-full w-full">
              <Icon name={props.scr} className="fill-muted-foreground size-8" />
            </div>
          </div>
          <div className="min-w-0 flex-grow overflow-hidden mx-2">
            <label className="block text-sm font-normal  text-muted-foreground truncate">
              {props.title}
            </label>
            {props.subtitle && (
              <label className="block text-[8px] font-extralight uppercase text-muted-foreground truncate">
                {props.subtitle}
              </label>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          {props.click && (
            <Button onClick={props.click}>
              {props.buttonTitle ?? "Change"}
            </Button>
          )}
        </div>
      </div>
      {props.error && (
        <label
          typeof="error"
          className="block mt-2 text-[8px] font-extralight text-destructive"
        >
          {props.error}
        </label>
      )}
    </div>
  );
}
