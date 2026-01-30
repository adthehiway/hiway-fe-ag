"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { Button } from "./button";
import { X } from "lucide-react";
import { Loader } from "./loader";

interface Props {
  id: string;
  label?: string;
  src?: string;
  name?: string;
  error?: string;
  border?: boolean;
  buttonType?: "primary" | "secondary";
  buttonText?: string;
  changeButtonText?: string;
  accept: string;
  remove: () => void;
  onChange: (value: any) => any;
  onTrigger?: () => void;
  isUploading?: boolean;
}

export function InputFile(props: Props) {
  const [src, setSrc] = useState(props.src);
  const [name, setName] = useState(props.name);

  useEffect(() => {
    setSrc(props.src);
  }, [props.src]);

  useEffect(() => {
    setName(props.name);
  }, [props.name]);

  return (
    <div className="w-full">
      {props.label && (
        <label className="font-primary pb-2 text-[10px] font-light uppercase text-muted-foreground w-full flex">
          {props.label ? props.label : "Company logo *"}
        </label>
      )}
      <div
        className={`
          ${props.border && !props.error && "border border-border"}
          ${props.error && "border border-destructive"}
          flex flex-row justify-between h-[62px] bg-muted rounded-lg w-full p-2.5 items-center
        `}
      >
        <div className="flex flex-row items-center">
          <div className="h-[48px] w-[48px] relative">
            <div className="bg-muted rounded-[8px] flex justify-center items-center overflow-hidden h-[48px] w-[48px]">
              {!src && (
                <Icon name="photo" className="fill-muted-foreground size-8" />
              )}
              {src && <img src={src} className="w-full h-full object-cover" />}
            </div>
            {props.isUploading && <Loader />}
          </div>
          <label className="font-primary   block m-2 uppercase text-muted-foreground overflow-hidden">
            {name && (
              <span className="line-clamp-2 text-[13px] font-normal">
                {name}
              </span>
            )}
            {!name && (
              <div className="flex flex-col">
                <span className="text-[13px] font-medium">
                  {props.label ? props.label : "Profile image"}
                </span>
                <span className="text-[10px] font-light text-muted-foreground">
                  Please add image up to 2 mb
                </span>
              </div>
            )}
          </label>
        </div>

        <input
          type="file"
          id={props.id}
          className="absolute w-0 h-0 overflow-hidden"
          multiple={false}
          accept={props.accept}
          onChange={(event: any) => {
            setSrc(URL.createObjectURL(event.target.files[0]));
            setName(event.target.files[0].name);
            props.onChange(event.target.files[0]);
          }}
        />

        {src && !props.isUploading && (
          <Button
            variant="secondary"
            className={props.changeButtonText ? "min-w-[118px]" : ""}
            onClick={() => {
              if (props.onTrigger) {
                props.onTrigger();
              } else {
                props.remove();
                setSrc(undefined);
                setName(undefined);
              }
            }}
          >
            {props.changeButtonText || <X className="size-4" />}
          </Button>
        )}

        {!src && !props.isUploading && (
          <Button
            className="min-w-[118px] bg-accent "
            onClick={() => {
              if (props.onTrigger) {
                props.onTrigger();
              } else {
                const input: any = document.getElementById(props.id);
                input.click();
              }
            }}
          >
            {props.buttonText || "Add image"}
          </Button>
        )}
      </div>

      {props.error && (
        <label
          typeof="error"
          className="font-primary block mt-2 text-[10px] font-extralight text-destructive"
        >
          {props.error}
        </label>
      )}
    </div>
  );
}
