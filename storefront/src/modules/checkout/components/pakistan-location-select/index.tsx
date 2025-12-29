"use client"

import { useMemo, useEffect } from "react"
import SearchableSelect from "@modules/common/components/searchable-select"
import {
  PAKISTAN_PROVINCES,
  getCitiesByProvince,
  getProvinceByName,
} from "@lib/data/pakistan-locations"

interface PakistanLocationSelectProps {
  provinceValue: string
  cityValue: string
  onProvinceChange: (value: string) => void
  onCityChange: (value: string) => void
  addressPrefix: "shipping_address" | "billing_address"
  required?: boolean
}

const PakistanLocationSelect = ({
  provinceValue,
  cityValue,
  onProvinceChange,
  onCityChange,
  addressPrefix,
  required = true,
}: PakistanLocationSelectProps) => {
  const provinceOptions = useMemo(
    () =>
      PAKISTAN_PROVINCES.map((p) => ({
        value: p.name,
        label: p.name,
      })),
    []
  )

  const province = useMemo(
    () => getProvinceByName(provinceValue),
    [provinceValue]
  )

  const cityOptions = useMemo(() => {
    const prov = getProvinceByName(provinceValue)
    if (!prov) return []
    return getCitiesByProvince(prov.code).map((c) => ({
      value: c.name,
      label: c.name,
    }))
  }, [provinceValue])

  useEffect(() => {
    if (province && cityValue) {
      const cityExists = cityOptions.some((c) => c.value === cityValue)
      if (!cityExists) {
        onCityChange("")
      }
    }
  }, [province, cityValue, cityOptions, onCityChange])

  const handleProvinceChange = (value: string) => {
    onProvinceChange(value)
    onCityChange("")
  }

  const isProvinceSelected = !!province

  return (
    <>
      <SearchableSelect
        options={provinceOptions}
        value={provinceValue}
        onChange={handleProvinceChange}
        name={`${addressPrefix}.province`}
        label="Province"
        placeholder="Select province..."
        required={required}
        data-testid={`${addressPrefix.replace("_", "-")}-province-select`}
      />
      <SearchableSelect
        options={cityOptions}
        value={cityValue}
        onChange={onCityChange}
        name={`${addressPrefix}.city`}
        label="City"
        placeholder={isProvinceSelected ? "Select city..." : "Select province first"}
        required={required}
        disabled={!isProvinceSelected}
        data-testid={`${addressPrefix.replace("_", "-")}-city-select`}
      />
    </>
  )
}

export default PakistanLocationSelect
