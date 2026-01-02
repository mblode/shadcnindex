"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";

import {
  Example,
  ExampleWrapper,
} from "@/registry/bases/base/components/example";
import { Badge } from "@/registry/bases/base/ui/badge";
import { Checkbox } from "@/registry/bases/base/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/registry/bases/base/ui/field";
import { Input } from "@/registry/bases/base/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/bases/base/ui/input-otp";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/registry/bases/base/ui/native-select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/registry/bases/base/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/base/ui/select";
import { Slider } from "@/registry/bases/base/ui/slider";
import { Switch } from "@/registry/bases/base/ui/switch";
import { Textarea } from "@/registry/bases/base/ui/textarea";

export default function FieldExample() {
  return (
    <ExampleWrapper>
      <InputFields />
      <TextareaFields />
      <SelectFields />
      <CheckboxFields />
      <RadioFields />
      <SwitchFields />
      <SliderFields />
      <NativeSelectFields />
      <InputOTPFields />
    </ExampleWrapper>
  );
}

function InputFields() {
  return (
    <Example title="Input Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="input-basic">Basic Input</FieldLabel>
          <Input id="input-basic" placeholder="Enter text" />
        </Field>
        <Field>
          <FieldLabel htmlFor="input-with-desc">
            Input with Description
          </FieldLabel>
          <Input id="input-with-desc" placeholder="Enter your username" />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="input-desc-first">Email Address</FieldLabel>
          <FieldDescription>
            We&apos;ll never share your email with anyone.
          </FieldDescription>
          <Input
            id="input-desc-first"
            placeholder="email@example.com"
            type="email"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="input-required">
            Required Field <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="input-required"
            placeholder="This field is required"
            required
          />
          <FieldDescription>This field must be filled out.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="input-disabled">Disabled Input</FieldLabel>
          <Input disabled id="input-disabled" placeholder="Cannot edit" />
          <FieldDescription>This field is currently disabled.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="input-badge">
            Input with Badge{" "}
            <Badge className="ml-auto" variant="secondary">
              Recommended
            </Badge>
          </FieldLabel>
          <Input id="input-badge" placeholder="Enter value" />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="input-invalid">Invalid Input</FieldLabel>
          <Input
            aria-invalid
            id="input-invalid"
            placeholder="This field has an error"
          />
          <FieldDescription>
            This field contains validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="input-disabled-field">Disabled Field</FieldLabel>
          <Input disabled id="input-disabled-field" placeholder="Cannot edit" />
          <FieldDescription>This field is currently disabled.</FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function TextareaFields() {
  return (
    <Example title="Textarea Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="textarea-basic">Basic Textarea</FieldLabel>
          <Textarea id="textarea-basic" placeholder="Enter your message" />
        </Field>
        <Field>
          <FieldLabel htmlFor="textarea-comments">Comments</FieldLabel>
          <Textarea
            className="min-h-[100px]"
            id="textarea-comments"
            placeholder="Share your thoughts..."
          />
          <FieldDescription>Maximum 500 characters allowed.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="textarea-bio">Bio</FieldLabel>
          <FieldDescription>
            Tell us about yourself in a few sentences.
          </FieldDescription>
          <Textarea
            className="min-h-[120px]"
            id="textarea-bio"
            placeholder="I am a..."
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="textarea-desc-after">Message</FieldLabel>
          <Textarea id="textarea-desc-after" placeholder="Enter your message" />
          <FieldDescription>
            Enter your message so it is long enough to test the layout.
          </FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="textarea-invalid">Invalid Textarea</FieldLabel>
          <Textarea
            aria-invalid
            id="textarea-invalid"
            placeholder="This field has an error"
          />
          <FieldDescription>
            This field contains validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="textarea-disabled-field">
            Disabled Field
          </FieldLabel>
          <Textarea
            disabled
            id="textarea-disabled-field"
            placeholder="Cannot edit"
          />
          <FieldDescription>This field is currently disabled.</FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function SelectFields() {
  const basicItems = [
    { label: "Choose an option", value: null },
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];
  const countryItems = [
    { label: "Select your country", value: null },
    { label: "United States", value: "us" },
    { label: "United Kingdom", value: "uk" },
    { label: "Canada", value: "ca" },
  ];
  const timezoneItems = [
    { label: "Select timezone", value: null },
    { label: "UTC", value: "utc" },
    { label: "Eastern Time", value: "est" },
    { label: "Pacific Time", value: "pst" },
  ];
  const invalidItems = [
    { label: "This field has an error", value: null },
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];
  const disabledItems = [
    { label: "Cannot select", value: null },
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  return (
    <Example title="Select Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="select-basic">Basic Select</FieldLabel>
          <Select items={basicItems}>
            <SelectTrigger id="select-basic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {basicItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="select-country">Country</FieldLabel>
          <Select items={countryItems}>
            <SelectTrigger id="select-country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {countryItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            Select the country where you currently reside.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="select-timezone">Timezone</FieldLabel>
          <FieldDescription>
            Choose your local timezone for accurate scheduling.
          </FieldDescription>
          <Select items={timezoneItems}>
            <SelectTrigger id="select-timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {timezoneItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="select-invalid">Invalid Select</FieldLabel>
          <Select items={invalidItems}>
            <SelectTrigger aria-invalid id="select-invalid">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {invalidItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            This field contains validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="select-disabled-field">
            Disabled Field
          </FieldLabel>
          <Select disabled items={disabledItems}>
            <SelectTrigger id="select-disabled-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {disabledItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>This field is currently disabled.</FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function NativeSelectFields() {
  return (
    <Example title="Native Select Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="native-select-basic">
            Basic Native Select
          </FieldLabel>
          <NativeSelect id="native-select-basic">
            <NativeSelectOption value="">Choose an option</NativeSelectOption>
            <NativeSelectOption value="option1">Option 1</NativeSelectOption>
            <NativeSelectOption value="option2">Option 2</NativeSelectOption>
            <NativeSelectOption value="option3">Option 3</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="native-select-country">Country</FieldLabel>
          <NativeSelect id="native-select-country">
            <NativeSelectOption value="">
              Select your country
            </NativeSelectOption>
            <NativeSelectOption value="us">United States</NativeSelectOption>
            <NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
            <NativeSelectOption value="ca">Canada</NativeSelectOption>
          </NativeSelect>
          <FieldDescription>
            Select the country where you currently reside.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="native-select-timezone">Timezone</FieldLabel>
          <FieldDescription>
            Choose your local timezone for accurate scheduling.
          </FieldDescription>
          <NativeSelect id="native-select-timezone">
            <NativeSelectOption value="">Select timezone</NativeSelectOption>
            <NativeSelectOption value="utc">UTC</NativeSelectOption>
            <NativeSelectOption value="est">Eastern Time</NativeSelectOption>
            <NativeSelectOption value="pst">Pacific Time</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="native-select-grouped">
            Grouped Options
          </FieldLabel>
          <NativeSelect id="native-select-grouped">
            <NativeSelectOption value="">Select a region</NativeSelectOption>
            <NativeSelectOptGroup label="North America">
              <NativeSelectOption value="us">United States</NativeSelectOption>
              <NativeSelectOption value="ca">Canada</NativeSelectOption>
              <NativeSelectOption value="mx">Mexico</NativeSelectOption>
            </NativeSelectOptGroup>
            <NativeSelectOptGroup label="Europe">
              <NativeSelectOption value="uk">United Kingdom</NativeSelectOption>
              <NativeSelectOption value="fr">France</NativeSelectOption>
              <NativeSelectOption value="de">Germany</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
          <FieldDescription>
            Native select with grouped options using optgroup.
          </FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="native-select-invalid">
            Invalid Native Select
          </FieldLabel>
          <NativeSelect aria-invalid id="native-select-invalid">
            <NativeSelectOption value="">
              This field has an error
            </NativeSelectOption>
            <NativeSelectOption value="option1">Option 1</NativeSelectOption>
            <NativeSelectOption value="option2">Option 2</NativeSelectOption>
            <NativeSelectOption value="option3">Option 3</NativeSelectOption>
          </NativeSelect>
          <FieldDescription>
            This field contains validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="native-select-disabled-field">
            Disabled Field
          </FieldLabel>
          <NativeSelect disabled id="native-select-disabled-field">
            <NativeSelectOption value="">Cannot select</NativeSelectOption>
            <NativeSelectOption value="option1">Option 1</NativeSelectOption>
            <NativeSelectOption value="option2">Option 2</NativeSelectOption>
            <NativeSelectOption value="option3">Option 3</NativeSelectOption>
          </NativeSelect>
          <FieldDescription>This field is currently disabled.</FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function CheckboxFields() {
  return (
    <Example title="Checkbox Fields">
      <FieldGroup>
        <Field orientation="horizontal">
          <Checkbox defaultChecked id="checkbox-basic" />
          <FieldLabel className="font-normal" htmlFor="checkbox-basic">
            I agree to the terms and conditions
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="checkbox-right">
            Accept terms and conditions
          </FieldLabel>
          <Checkbox id="checkbox-right" />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="checkbox-with-desc" />
          <FieldContent>
            <FieldLabel htmlFor="checkbox-with-desc">
              Subscribe to newsletter
            </FieldLabel>
            <FieldDescription>
              Receive weekly updates about new features and promotions.
            </FieldDescription>
          </FieldContent>
        </Field>
        <FieldLabel htmlFor="checkbox-with-title">
          <Field orientation="horizontal">
            <Checkbox id="checkbox-with-title" />
            <FieldContent>
              <FieldTitle>Enable Touch ID</FieldTitle>
              <FieldDescription>
                Enable Touch ID to quickly unlock your device.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
        <FieldSet>
          <FieldLegend variant="label">Preferences</FieldLegend>
          <FieldDescription>
            Select all that apply to customize your experience.
          </FieldDescription>
          <FieldGroup className="gap-3">
            <Field orientation="horizontal">
              <Checkbox id="pref-dark" />
              <FieldLabel className="font-normal" htmlFor="pref-dark">
                Dark mode
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="pref-compact" />
              <FieldLabel className="font-normal" htmlFor="pref-compact">
                Compact view
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="pref-notifications" />
              <FieldLabel className="font-normal" htmlFor="pref-notifications">
                Enable notifications
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field data-invalid orientation="horizontal">
          <Checkbox aria-invalid id="checkbox-invalid" />
          <FieldLabel className="font-normal" htmlFor="checkbox-invalid">
            Invalid checkbox
          </FieldLabel>
        </Field>
        <Field data-disabled orientation="horizontal">
          <Checkbox disabled id="checkbox-disabled-field" />
          <FieldLabel className="font-normal" htmlFor="checkbox-disabled-field">
            Disabled checkbox
          </FieldLabel>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function RadioFields() {
  return (
    <Example title="Radio Fields">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Subscription Plan</FieldLegend>
          <RadioGroup defaultValue="free">
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-free" value="free" />
              <FieldLabel className="font-normal" htmlFor="radio-free">
                Free Plan
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-pro" value="pro" />
              <FieldLabel className="font-normal" htmlFor="radio-pro">
                Pro Plan
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-enterprise" value="enterprise" />
              <FieldLabel className="font-normal" htmlFor="radio-enterprise">
                Enterprise
              </FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Battery Level</FieldLegend>
          <FieldDescription>
            Choose your preferred battery level.
          </FieldDescription>
          <RadioGroup>
            <Field orientation="horizontal">
              <RadioGroupItem id="battery-high" value="high" />
              <FieldLabel htmlFor="battery-high">High</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="battery-medium" value="medium" />
              <FieldLabel htmlFor="battery-medium">Medium</FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem id="battery-low" value="low" />
              <FieldLabel htmlFor="battery-low">Low</FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
        <RadioGroup className="gap-6">
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-content-1" value="option1" />
            <FieldContent>
              <FieldLabel htmlFor="radio-content-1">Enable Touch ID</FieldLabel>
              <FieldDescription>
                Enable Touch ID to quickly unlock your device.
              </FieldDescription>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="radio-content-2" value="option2" />
            <FieldContent>
              <FieldLabel htmlFor="radio-content-2">
                Enable Touch ID and Face ID to make it even faster to unlock
                your device. This is a long label to test the layout.
              </FieldLabel>
              <FieldDescription>
                Enable Touch ID to quickly unlock your device.
              </FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
        <RadioGroup className="gap-3">
          <FieldLabel htmlFor="radio-title-1">
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-title-1" value="title1" />
              <FieldContent>
                <FieldTitle>Enable Touch ID</FieldTitle>
                <FieldDescription>
                  Enable Touch ID to quickly unlock your device.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="radio-title-2">
            <Field orientation="horizontal">
              <RadioGroupItem id="radio-title-2" value="title2" />
              <FieldContent>
                <FieldTitle>
                  Enable Touch ID and Face ID to make it even faster to unlock
                  your device. This is a long label to test the layout.
                </FieldTitle>
                <FieldDescription>
                  Enable Touch ID to quickly unlock your device.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
        <FieldSet>
          <FieldLegend variant="label">Invalid Radio Group</FieldLegend>
          <RadioGroup>
            <Field data-invalid orientation="horizontal">
              <RadioGroupItem
                aria-invalid
                id="radio-invalid-1"
                value="invalid1"
              />
              <FieldLabel htmlFor="radio-invalid-1">
                Invalid Option 1
              </FieldLabel>
            </Field>
            <Field data-invalid orientation="horizontal">
              <RadioGroupItem
                aria-invalid
                id="radio-invalid-2"
                value="invalid2"
              />
              <FieldLabel htmlFor="radio-invalid-2">
                Invalid Option 2
              </FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">Disabled Radio Group</FieldLegend>
          <RadioGroup disabled>
            <Field data-disabled orientation="horizontal">
              <RadioGroupItem
                disabled
                id="radio-disabled-1"
                value="disabled1"
              />
              <FieldLabel htmlFor="radio-disabled-1">
                Disabled Option 1
              </FieldLabel>
            </Field>
            <Field data-disabled orientation="horizontal">
              <RadioGroupItem
                disabled
                id="radio-disabled-2"
                value="disabled2"
              />
              <FieldLabel htmlFor="radio-disabled-2">
                Disabled Option 2
              </FieldLabel>
            </Field>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </Example>
  );
}

function SwitchFields() {
  return (
    <Example title="Switch Fields">
      <FieldGroup>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-airplane">Airplane Mode</FieldLabel>
            <FieldDescription>
              Turn on airplane mode to disable all connections.
            </FieldDescription>
          </FieldContent>
          <Switch id="switch-airplane" />
        </Field>
        <Field orientation="horizontal">
          <FieldLabel htmlFor="switch-dark">Dark Mode</FieldLabel>
          <Switch id="switch-dark" />
        </Field>
        <Field orientation="horizontal">
          <Switch id="switch-marketing" />
          <FieldContent>
            <FieldLabel htmlFor="switch-marketing">Marketing Emails</FieldLabel>
            <FieldDescription>
              Receive emails about new products, features, and more.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>Privacy Settings</FieldLabel>
          <FieldDescription>Manage your privacy preferences.</FieldDescription>
          <Field orientation="horizontal">
            <Switch defaultChecked id="switch-profile" />
            <FieldContent>
              <FieldLabel className="font-normal" htmlFor="switch-profile">
                Make profile visible to others
              </FieldLabel>
            </FieldContent>
          </Field>
          <Field orientation="horizontal">
            <Switch id="switch-email" />
            <FieldContent>
              <FieldLabel className="font-normal" htmlFor="switch-email">
                Show email on profile
              </FieldLabel>
            </FieldContent>
          </Field>
        </Field>
        <Field data-invalid orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-invalid">Invalid Switch</FieldLabel>
            <FieldDescription>
              This switch has validation errors.
            </FieldDescription>
          </FieldContent>
          <Switch aria-invalid id="switch-invalid" />
        </Field>
        <Field data-disabled orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="switch-disabled-field">
              Disabled Switch
            </FieldLabel>
            <FieldDescription>
              This switch is currently disabled.
            </FieldDescription>
          </FieldContent>
          <Switch disabled id="switch-disabled-field" />
        </Field>
      </FieldGroup>
    </Example>
  );
}

function SliderFields() {
  const [volume, setVolume] = useState([50]);
  const [brightness, setBrightness] = useState([75]);
  const [temperature, setTemperature] = useState([0.3, 0.7]);
  const [priceRange, setPriceRange] = useState([25, 75]);
  const [colorBalance, setColorBalance] = useState([10, 20, 70]);

  return (
    <Example title="Slider Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="slider-volume">Volume</FieldLabel>
          <Slider
            id="slider-volume"
            max={100}
            onValueChange={(value) => setVolume(value as number[])}
            step={1}
            value={volume}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="slider-brightness">Screen Brightness</FieldLabel>
          <Slider
            id="slider-brightness"
            max={100}
            onValueChange={(value) => setBrightness(value as number[])}
            step={5}
            value={brightness}
          />
          <FieldDescription>
            Current brightness: {brightness[0]}%
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="slider-quality">Video Quality</FieldLabel>
          <FieldDescription>
            Higher quality uses more bandwidth.
          </FieldDescription>
          <Slider
            defaultValue={[720]}
            id="slider-quality"
            max={1080}
            min={360}
            step={360}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="slider-temperature">
            Temperature Range
          </FieldLabel>
          <Slider
            id="slider-temperature"
            max={1}
            min={0}
            onValueChange={(value) => setTemperature(value as number[])}
            step={0.1}
            value={temperature}
          />
          <FieldDescription>
            Range: {temperature[0].toFixed(1)} - {temperature[1].toFixed(1)}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="slider-price-range">Price Range</FieldLabel>
          <Slider
            id="slider-price-range"
            max={100}
            onValueChange={(value) => setPriceRange(value as number[])}
            step={5}
            value={priceRange}
          />
          <FieldDescription>
            ${priceRange[0]} - ${priceRange[1]}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="slider-color-balance">Color Balance</FieldLabel>
          <Slider
            id="slider-color-balance"
            max={100}
            onValueChange={(value) => setColorBalance(value as number[])}
            step={10}
            value={colorBalance}
          />
          <FieldDescription>
            Red: {colorBalance[0]}%, Green: {colorBalance[1]}%, Blue:{" "}
            {colorBalance[2]}%
          </FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="slider-invalid">Invalid Slider</FieldLabel>
          <Slider
            aria-invalid
            defaultValue={[30]}
            id="slider-invalid"
            max={100}
          />
          <FieldDescription>
            This slider has validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="slider-disabled-field">
            Disabled Slider
          </FieldLabel>
          <Slider
            defaultValue={[50]}
            disabled
            id="slider-disabled-field"
            max={100}
          />
          <FieldDescription>
            This slider is currently disabled.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}

function InputOTPFields() {
  const [value, setValue] = useState("");
  const [pinValue, setPinValue] = useState("");

  return (
    <Example title="OTP Input Fields">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="otp-basic">Verification Code</FieldLabel>
          <InputOTP id="otp-basic" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Field>
        <Field>
          <FieldLabel htmlFor="otp-with-desc">Enter OTP</FieldLabel>
          <InputOTP
            id="otp-with-desc"
            maxLength={6}
            onChange={setValue}
            value={value}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            Enter the 6-digit code sent to your email.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="otp-separator">
            Two-Factor Authentication
          </FieldLabel>
          <InputOTP id="otp-separator" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            Enter the code from your authenticator app.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="otp-pin">PIN Code</FieldLabel>
          <InputOTP
            id="otp-pin"
            maxLength={4}
            onChange={setPinValue}
            pattern={REGEXP_ONLY_DIGITS}
            value={pinValue}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            Enter your 4-digit PIN (numbers only).
          </FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="otp-invalid">Invalid OTP</FieldLabel>
          <InputOTP id="otp-invalid" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot aria-invalid index={0} />
              <InputOTPSlot aria-invalid index={1} />
              <InputOTPSlot aria-invalid index={2} />
              <InputOTPSlot aria-invalid index={3} />
              <InputOTPSlot aria-invalid index={4} />
              <InputOTPSlot aria-invalid index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            This OTP field contains validation errors.
          </FieldDescription>
        </Field>
        <Field data-disabled>
          <FieldLabel htmlFor="otp-disabled-field">Disabled OTP</FieldLabel>
          <InputOTP disabled id="otp-disabled-field" maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>
            This OTP field is currently disabled.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </Example>
  );
}
