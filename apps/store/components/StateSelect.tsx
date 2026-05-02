"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";

const DELHIVERY_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function StateSelect({ value, onChange, required }: StateSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange} required={required}>
      <Select.Trigger
        className="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-gray-50 flex items-center justify-between cursor-pointer data-[placeholder]:text-gray-400"
        aria-label="State"
        tabIndex={0}
      >
        <Select.Value placeholder="Select state" />
        <Select.Icon>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-[200] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          position="popper"
          sideOffset={6}
          style={{ width: "var(--radix-select-trigger-width)", maxHeight: "280px" }}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-400 cursor-default">
            <ChevronDown className="w-3 h-3 rotate-180" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1.5 overflow-y-auto" style={{ maxHeight: "280px" }}>
            {DELHIVERY_STATES.map((state) => (
              <Select.Item
                key={state}
                value={state}
                className="relative flex items-center px-3 py-2.5 text-sm text-gray-700 rounded-xl cursor-pointer select-none outline-none hover:bg-amber-50 focus:bg-amber-50 data-[highlighted]:bg-amber-50 data-[state=checked]:text-amber-700 data-[state=checked]:font-semibold"
              >
                <Select.ItemText>{state}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-3">
                  <Check className="w-3.5 h-3.5 text-amber-500" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-400 cursor-default">
            <ChevronDown className="w-3 h-3" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
