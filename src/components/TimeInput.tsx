import React, { useState } from "react";

function formatTime(value: string): string {
  // Solo números
  const digits = value.replace(/\D/g, "").slice(0, 5);

  let m = "";
  let ss = "";
  let ms = "";

  if (digits.length >= 1) m = digits.slice(0, 1);
  if (digits.length >= 3) ss = digits.slice(1, 3);
  else if (digits.length >= 2) ss = digits.slice(1, 2);
  if (digits.length >= 4) ms = digits.slice(3, 5);

  let result = "";

  if (m) result += m;
  if (ss) result += `:${ss}`;
  if (ms) result += `.${ms}`;

  return result;
}

const TimeInput: React.FC = () => {
  const [time, setTime] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(formatTime(e.target.value));
  };

  return (
    <input
      type="text"
      value={time}
      onChange={handleChange}
      placeholder="m:ss.ms"
      className="border rounded px-3 py-2 w-32 text-center"
      inputMode="numeric"
    />
  );
};

export default TimeInput;
