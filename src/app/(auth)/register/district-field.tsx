"use client";

import { useState } from "react";
import { MapPin } from "@/components/icons";
import { districtOptions } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { Field, Select } from "@/components/ui";

/**
 * District picker for the sign-up form.
 *
 * A client island because the register page is a server component and `Select`
 * is now a real popover owning open state. `name="district"` keeps the field in
 * the submitted form, exactly as the native control did.
 */
export function DistrictField() {
  const { locale } = useI18n();
  const [district, setDistrict] = useState("dhaka");

  return (
    <Field
      label="আপনার জেলা"
      htmlFor="district"
      hint="নামাজের সময়সূচি ও স্থানীয় কনটেন্টের জন্য — পরে সেটিংসে বদলাতে পারবেন"
    >
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-subtle-foreground"
          aria-hidden
        />
        <Select
          id="district"
          name="district"
          value={district}
          onChange={setDistrict}
          options={districtOptions(locale)}
          className="pl-10"
        />
      </div>
    </Field>
  );
}
