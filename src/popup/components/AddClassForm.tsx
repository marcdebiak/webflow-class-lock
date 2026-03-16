import { useState } from "react";

interface Props {
  existingClasses: string[];
  onAdd: (className: string) => void;
}

export function AddClassForm({ existingClasses, onAdd }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalise = (raw: string) =>
    raw.replace(/^\./, "").trim().toLowerCase();

  const validate = (raw: string): string | null => {
    const name = normalise(raw);
    if (!name) return "Enter a class name.";
    if (/\s/.test(name)) return "Class names cannot contain spaces.";
    if (existingClasses.includes(name)) return `${name} is already protected.`;
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(value);
    if (err) {
      setError(err);
      return;
    }
    onAdd(normalise(value));
    setValue("");
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError(null);
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form__row">
        <input
          className={`add-form__input ${error ? "add-form__input--error" : ""}`}
          type="text"
          placeholder="e.g. u-visually-hidden"
          value={value}
          onChange={handleChange}
          spellCheck={false}
          autoComplete="off"
        />
        <button
          className="add-form__button"
          type="submit"
          disabled={!value.trim()}
        >
          Protect
        </button>
      </div>
      {error && <p className="add-form__error">{error}</p>}
    </form>
  );
}
