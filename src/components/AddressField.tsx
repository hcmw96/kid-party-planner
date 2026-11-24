import { useEffect, useId, useRef, useState } from "react";
import { searchPlaces, type PlaceMatch } from "@/lib/places";

interface Value {
  label: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  value: string;
  onChange: (value: Value) => void;
}

const AddressField = ({ value, onChange }: Props) => {
  const listId = useId();
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<PlaceMatch[]>([]);
  const [active, setActive] = useState(0);
  const request = useRef(0);
  const timer = useRef(0);
  const chosen = useRef<string | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const search = (next: string) => {
    window.clearTimeout(timer.current);
    if (next === chosen.current) return;
    const trimmed = next.trim();
    if (trimmed.length < 2) {
      request.current += 1;
      setMatches([]);
      setOpen(false);
      return;
    }

    const current = ++request.current;
    timer.current = window.setTimeout(() => {
      void searchPlaces(trimmed)
        .then((found) => {
          if (current !== request.current) return;
          setMatches(found);
          setActive(0);
          setOpen(found.length > 0);
        })
        .catch(() => {
          if (current === request.current) {
            setMatches([]);
            setOpen(false);
          }
        });
    }, 200);
  };

  const edit = (next: string) => {
    chosen.current = null;
    setText(next);
    onChange({ label: next, address: null, lat: null, lng: null });
    search(next);
  };

  const choose = (place: PlaceMatch) => {
    chosen.current = place.label;
    setText(place.label);
    onChange({ label: place.label, address: place.address, lat: place.lat, lng: place.lng });
    setOpen(false);
    setMatches([]);
  };

  return (
    <div className="relative z-30">
      <label htmlFor="where" className="block">
        <span className="field-label">Where</span>
        <input
          id="where"
          name="party-venue"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="field-input"
          placeholder="A venue or address"
          value={text}
          onChange={(event) => edit(event.target.value)}
          onFocus={() => {
            if (matches.length) setOpen(true);
            else search(text);
          }}
          onKeyDown={(event) => {
            if (!open || !matches.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => (index + 1) % matches.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => (index - 1 + matches.length) % matches.length);
            } else if (event.key === "Enter" && matches[active]) {
              event.preventDefault();
              choose(matches[active]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
      </label>
      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-[18px] bg-white py-1 shadow-[0_16px_40px_rgba(40,32,53,0.12)]"
        >
          {matches.map((place, index) => (
            <li key={place.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`block w-full px-4 py-3 text-left ${index === active ? "bg-[#F3EEF8]" : "bg-white"}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(place)}
              >
                <span className="block text-[15px] font-bold tracking-[-0.02em] text-[#282035]">{place.title}</span>
                {place.subtitle ? (
                  <span className="mt-0.5 block text-[13px] leading-snug text-[#71677F]">{place.subtitle}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default AddressField;
