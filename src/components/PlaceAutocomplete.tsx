"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X } from "lucide-react";

interface PlaceAutocompleteProps {
  value: string;
  onChange: (val: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  id?: string;
  /** User's current location for result prioritization (location bias) */
  userLat?: number;
  userLng?: number;
}

// ── Simple debounce hook ──
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Suggestion = any;

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  id,
  userLat,
  userLng,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the places library (triggers loading the Maps JS places module)
  const placesLib = useMapsLibrary("places");

  // Debounce: only fire after 350ms of no typing
  const debouncedInput = useDebounce(inputValue, 350);

  // Sync external value changes (e.g. GPS auto-fill)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fetch suggestions from Places API (New) — fires only when debounced value changes
  useEffect(() => {
    if (!placesLib || !debouncedInput || debouncedInput.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsFetching(true);

    (async () => {
      try {
        // Places API (New) — AutocompleteSuggestion with no field masking needed at this step
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        if (!g?.maps?.places?.AutocompleteSuggestion) {
          // Fallback: API (New) not available yet, silently skip
          return;
        }

        const result = await g.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: debouncedInput,
          // Location bias: prioritize results within ~25km of user's position
          // (same behavior as Google Maps — nearby first, falls back to global)
          ...(userLat !== undefined && userLng !== undefined
            ? {
                locationBias: {
                  center: { lat: userLat, lng: userLng },
                  radius: 25000, // 25 km
                },
              }
            : {}),
        });

        if (!cancelled) {
          setSuggestions(result?.suggestions ?? []);
          setIsOpen((result?.suggestions?.length ?? 0) > 0);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[PlaceAutocomplete] fetch error:", err);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    })();

    return () => { cancelled = true; };
  }, [placesLib, debouncedInput]);

  // Close on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // User picks a suggestion → fetch fields with masking (only what we need)
  const handleSelect = useCallback(async (suggestion: Suggestion) => {
    const prediction = suggestion.placePrediction;
    const displayText: string =
      prediction?.mainText?.text || prediction?.text?.text || "";

    setInputValue(displayText);
    setIsOpen(false);
    setSuggestions([]);

    try {
      // toPlace() returns a Place object (New API)
      const place = prediction.toPlace();

      // Field masking — only pay for these three fields
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      const lat: number | undefined = place.location?.lat?.();
      const lng: number | undefined = place.location?.lng?.();
      const name: string =
        place.displayName || place.formattedAddress || displayText;

      onChange(name, lat, lng);
    } catch (err) {
      console.warn("[PlaceAutocomplete] fetchFields error:", err);
      onChange(displayText);
    }
  }, [onChange]);

  function handleClear() {
    setInputValue("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="pac-new-wrapper">
      <input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          // Notify parent of raw typing (coords will come on selection)
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        className="form-input"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
      />

      {/* Clear button */}
      {inputValue && (
        <button
          type="button"
          className="pac-new-clear"
          onClick={handleClear}
          tabIndex={-1}
          aria-label="Hapus"
        >
          <X size={12} />
        </button>
      )}

      {/* Custom dropdown — replaces pac-container */}
      {isOpen && suggestions.length > 0 && (
        <div className="pac-new-dropdown" role="listbox">
          {suggestions.map((s: Suggestion, i: number) => {
            const p = s.placePrediction;
            const main: string = p?.mainText?.text ?? "";
            const secondary: string = p?.secondaryText?.text ?? "";
            return (
              <button
                key={i}
                type="button"
                role="option"
                className="pac-new-item"
                onMouseDown={() => handleSelect(s)}
              >
                <span className="pac-new-icon"><MapPin size={13} /></span>
                <span className="pac-new-text">
                  <span className="pac-new-main">{main}</span>
                  {secondary && (
                    <span className="pac-new-secondary">{secondary}</span>
                  )}
                </span>
              </button>
            );
          })}
          {isFetching && (
            <div className="pac-new-loading">Mencari lokasi...</div>
          )}
        </div>
      )}
    </div>
  );
}
