"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import InputEnhanced from "@/components/ui/input-enhanced";
import { Calendar, X, ArrowRight, Check, Ticket, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TicketType = "individual" | "collection";

interface EventFormData {
  name: string;
  description: string;
  date: string;
  ticketType: TicketType;
  ticketPrice: string;
  placeholderItems: string;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    date: "",
    ticketType: "individual",
    ticketPrice: "",
    placeholderItems: "3",
  });

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDone();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDone = () => {
    onClose();
    setCurrentStep(1);
    setFormData({
      name: "",
      description: "",
      date: "",
      ticketType: "individual",
      ticketPrice: "",
      placeholderItems: "3",
    });
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.name && formData.date;
    }
    if (currentStep === 2) {
      return formData.ticketPrice && formData.placeholderItems;
    }
    return true;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Create Event</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStep} of 3
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full ${
                step <= currentStep ? "bg-purple-500" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Event Details</h3>
            <div className="space-y-4">
              <div>
                <InputEnhanced
                  label="Event Name"
                  placeholder="e.g. Film Festival 2025"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-muted"
                />
              </div>
              <div>
                <InputEnhanced
                  label="Description"
                  placeholder="Brief description of your event"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  textarea
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="dd/mm/yyyy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Ticketing</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange("ticketType", "individual")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.ticketType === "individual"
                    ? "bg-purple-500 border-purple-600"
                    : "bg-muted border-muted"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Ticket
                    className={`h-8 w-8 ${
                      formData.ticketType === "individual"
                        ? "text-white"
                        : "text-purple-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formData.ticketType === "individual"
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    Individual Tickets
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChange("ticketType", "collection")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  formData.ticketType === "collection"
                    ? "bg-purple-500 border-purple-600"
                    : "bg-muted border-muted"
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Package
                    className={`h-8 w-8 ${
                      formData.ticketType === "collection"
                        ? "text-white"
                        : "text-purple-400"
                    }`}
                  />
                  <span
                    className={`font-medium ${
                      formData.ticketType === "collection"
                        ? "text-white"
                        : "text-muted-foreground"
                    }`}
                  >
                    Collection Pass
                  </span>
                </div>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <InputEnhanced
                  label="Ticket Price (USD)"
                  placeholder="19.99"
                  type="number"
                  value={formData.ticketPrice}
                  onChange={(e) => handleChange("ticketPrice", e.target.value)}
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Number of Placeholder Items
                </label>
                <Select
                  value={formData.placeholderItems}
                  onValueChange={(value) =>
                    handleChange("placeholderItems", value)
                  }
                >
                  <SelectTrigger className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "item" : "items"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-purple-500 flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Event Created!</h3>
              <p className="text-muted-foreground">
                Your event is ready. Add content to your placeholders.
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event:</span>
                <span className="text-white font-medium">
                  {formData.name || "test"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-white font-medium">
                  {formData.date ? formatDate(formData.date) : "2026-01-02"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ticket Type:</span>
                <span className="text-white font-medium capitalize">
                  {formData.ticketType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="text-white font-medium">
                  ${formData.ticketPrice || "9.99"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Placeholders:</span>
                <span className="text-white font-medium">
                  {formData.placeholderItems}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2">
          {currentStep > 1 && currentStep < 3 ? (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
          >
            {currentStep === 3 ? (
              "Done"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
