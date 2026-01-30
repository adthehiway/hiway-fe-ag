import React from "react";
import { Modal } from "../ui/modal";
import InputEnhanced from "../ui/input-enhanced";
import { Button } from "../ui/button";
import validator from "validator";
import SmartLinkService from "@/services/smartlinks";

const DetailsModal = ({
  isOpen,
  onClose,
  data,
  onDone,
  smartlinkId,
  onSubmit,
  sessionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: string[];
  onDone: () => void;
  smartlinkId: string;
  onSubmit?: (id: string, details: Record<string, string>, sessionId?: string) => Promise<void>;
  sessionId?: string;
}) => {
  const [inputs, setInputs] = React.useState<Record<string, string>>({
    ...data.reduce((acc, item) => ({ ...acc, [item]: "" }), {}),
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (key: string, value: string): string => {
    if (validator.isEmpty(value.trim())) {
      return `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
    }

    if (key === "email" && !validator.isEmail(value)) {
      return "Please enter a valid email address";
    }

    if (
      key === "phone" &&
      !validator.isEmpty(value) &&
      !validator.isMobilePhone(value)
    ) {
      return "Please enter a valid phone number";
    }

    return "";
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(inputs).forEach((key) => {
      const error = validateField(key, inputs[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(inputs).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return isValid;
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs({ ...inputs, [key]: value });

    if (errors[key]) {
      setErrors({ ...errors, [key]: "" });
    }
  };

  const handleInputBlur = (key: string) => {
    setTouched({ ...touched, [key]: true });
    const error = validateField(key, inputs[key]);
    setErrors({ ...errors, [key]: error });
  };

  const handleSubmit = () => {
    const isValid = validateAll();

    if (!isValid) {
      return;
    }

    const submitDetails = onSubmit
      ? onSubmit(smartlinkId, inputs, sessionId)
      : SmartLinkService.addDetails(smartlinkId, inputs, sessionId).then(() => undefined);

    submitDetails
      .then(() => {
        console.log("Details added successfully");
        onDone();
      })
      .catch((error) => {
        console.error("Error adding details:", error);
      });
  };

  React.useEffect(() => {
    if (!isOpen) {
      setErrors({});
      setTouched({});
      setInputs(data.reduce((acc, item) => ({ ...acc, [item]: "" }), {}));
    }
  }, [isOpen, data]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Watch Details"
      description="Please provide the required details to proceed."
    >
      {data.map((item, index) => (
        <InputEnhanced
          key={index}
          label={item}
          value={inputs[item]}
          onChange={(e) => handleInputChange(item, e.target.value)}
          onBlur={() => handleInputBlur(item)}
          error={touched[item] ? errors[item] : ""}
        />
      ))}

      <Button onClick={handleSubmit}>Submit</Button>
    </Modal>
  );
};

export default DetailsModal;
