"use client"

import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDown } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { Fragment, useState, useMemo, useEffect, useRef } from "react"

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  "data-testid"?: string
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  name,
  label,
  placeholder = "Select...",
  required = false,
  disabled = false,
  className,
  "data-testid": dataTestId,
}: SearchableSelectProps) => {
  const [query, setQuery] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    if (query === "") return options
    return options.filter((option) =>
      option.label
        .toLowerCase()
        .includes(query.toLowerCase())
    )
  }, [options, query])

  const handleChange = (option: SearchableSelectOption | null) => {
    onChange(option?.value || "")
    setQuery("")
  }

  return (
    <div className="flex flex-col w-full">
      <Listbox
        value={selectedOption}
        onChange={handleChange}
        disabled={disabled}
      >
        {({ open }) => (
          <div className="relative">
            <Listbox.Button
              className={clx(
                "relative w-full h-11 text-left bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base cursor-pointer",
                disabled
                  ? "bg-ui-bg-disabled text-ui-fg-disabled cursor-not-allowed"
                  : "hover:bg-ui-bg-field-hover",
                className
              )}
              data-testid={dataTestId}
            >
              <span
                className={clx(
                  "block truncate px-4 txt-compact-medium",
                  selectedOption ? "pt-4 pb-1" : "py-2.5"
                )}
              >
                {selectedOption?.label || ""}
              </span>
              <label
                className={clx(
                  "absolute left-4 transition-all duration-200 pointer-events-none bg-ui-bg-field px-1",
                  disabled ? "text-ui-fg-disabled" : "text-ui-fg-subtle",
                  selectedOption
                    ? "top-1 text-xs"
                    : "top-1/2 -translate-y-1/2 text-base"
                )}
              >
                {label}
                {required && <span className="text-rose-500">*</span>}
              </label>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronUpDown
                  className={clx(
                    "h-5 w-5",
                    disabled ? "text-ui-fg-disabled" : "text-ui-fg-subtle"
                  )}
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
              afterEnter={() => searchInputRef.current?.focus()}
            >
              <Listbox.Options
                static
                className="absolute z-50 mt-1 w-full overflow-hidden rounded-md bg-ui-bg-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                {/* Search input inside dropdown */}
                <div className="sticky top-0 z-10 bg-ui-bg-base p-2 border-b border-ui-border-base">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-ui-border-base rounded-md bg-ui-bg-field focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Options list */}
                <div className="max-h-60 overflow-auto py-1">
                  {filteredOptions.length === 0 ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-ui-fg-subtle text-sm">
                      No results found.
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active, selected }) =>
                          clx(
                            "relative cursor-pointer select-none py-2 pl-4 pr-4 text-sm",
                            active && "bg-ui-bg-base-hover",
                            selected && "font-medium bg-ui-bg-subtle"
                          )
                        }
                        value={option}
                      >
                        {({ selected }) => (
                          <span
                            className={clx(
                              "block truncate",
                              selected ? "font-medium" : "font-normal"
                            )}
                          >
                            {option.label}
                          </span>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </div>
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

export default SearchableSelect
