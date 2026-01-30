"use client";

import { useState } from "react";
import { Loader } from "../ui/loader";
import { Icon } from "../ui/icons";
import InputEnhanced from "../ui/input-enhanced";
import { Button } from "../ui/button";

interface Props {
  loading?: boolean;
  closeModel?: () => void;
  cancelChange?: () => void;
  sendDataToParent: (arg: string) => void;
  username: string;
}

export function ChangeUsername(props: Props) {
  const [submitError, setSubmitError] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [username, setUsername] = useState<string>(props.username);

  function checkUsername(username: string) {
    const regex = new RegExp(/^\S+$/);
    setDisabled(!regex.test(username));
    setUsername(username);
    setSubmitError("");
  }

  const handleSave = () => {
    console.log("Save clicked, username:", username);
    props.sendDataToParent(username);
  };

  return (
    <>
      {props.loading && <Loader backdrop={false} />}

      <div className="w-full flex flex-col gap-4">
        <InputEnhanced
          placeholder="Enter username"
          label="Username"
          value={username}
          onChange={(e) => checkUsername(e.target.value)}
          error={submitError}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={disabled || props.loading}
          onClick={handleSave}
        >
          Save Changes
        </Button>
        <Button
          variant="secondary"
          type="button"
          className="w-full"
          onClick={props.cancelChange}
          disabled={props.loading}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
