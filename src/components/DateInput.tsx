import { useEffect, useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

type DateInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

function toDisplayDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

function toStorageDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const year = Number(match[3]);
  const month = Number(match[2]);
  const day = Number(match[1]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function formatTypedDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

export function DateInput({ value, onChange, ...props }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState(() => toDisplayDate(value));

  useEffect(() => setDisplayValue(toDisplayDate(value)), [value]);

  return (
    <Input
      {...props}
      dir="ltr"
      lang="en-GB"
      inputMode="numeric"
      maxLength={10}
      placeholder="DD/MM/YYYY"
      value={displayValue}
      onChange={(event) => {
        const next = formatTypedDate(event.target.value);
        setDisplayValue(next);
        const storageDate = toStorageDate(next);
        if (storageDate || !next) onChange(storageDate ?? "");
      }}
    />
  );
}