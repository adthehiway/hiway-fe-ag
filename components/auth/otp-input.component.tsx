import { useEffect, useRef, useState } from "react";

interface Props {
  error?: string;
  emit: (otp: string) => void;
}

export function OtpInput(props: Props) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const lastInputRef = useRef(null);

  const handleChange = (e: any, index: any) => {
    const value = e.target.value.slice(-1);
    if (!isNaN(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (index < 5 && value !== "") {
        (document.getElementById(`otp-input-${index + 1}`) as any).focus();
      } else if (index === 5 && value !== "") {
        e.target.blur();
      }
    }
  };

  const handlePaste = (e: any) => {
    const pastedData = e.clipboardData.getData("text").replace(/\s/g, "");
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      e.target.blur();
    }
  };

  const handleKeyDown = (e: any, index: any) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        newOtp[index - 1] = "";
        return newOtp;
      });
      (document.getElementById(`otp-input-${index - 1}`) as any).focus();
    }
  };

  useEffect(() => {
    if (!otp.includes("")) {
      props.emit(otp.join(""));
    }
  }, [otp]);

  return (
    <div>
      <div className="flex justify-center items-center w-full">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            ref={index === 5 ? lastInputRef : null}
            type="tel"
            className={`w-full h-[48px] xl:h-[72px] bg-muted  text-[20px] xl:text-[24px]  placeholder:text-[24px] mx-1 text-center rounded`}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      {props.error && (
        <label
          typeof="error"
          className="block mt-2 text-[10px] font-extralight text-destructive"
        >
          {props.error}
        </label>
      )}
    </div>
  );
}
