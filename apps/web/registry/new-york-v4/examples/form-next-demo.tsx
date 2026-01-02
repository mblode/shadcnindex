"use client";

import Form from "next/form";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/registry/new-york-v4/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/new-york-v4/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/registry/new-york-v4/ui/field";
import { Input } from "@/registry/new-york-v4/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/new-york-v4/ui/input-group";
import { Spinner } from "@/registry/new-york-v4/ui/spinner";

import { demoFormAction } from "./form-next-demo-action";
import type { FormState } from "./form-next-demo-schema";

export default function FormNextDemo() {
  const [formState, formAction, pending] = React.useActionState<
    FormState,
    FormData
  >(demoFormAction, {
    values: {
      title: "",
      description: "",
    },
    errors: null,
    success: false,
  });
  const [descriptionLength, setDescriptionLength] = React.useState(0);

  React.useEffect(() => {
    if (formState.success) {
      toast("Thank you for your feedback", {
        description: "We'll review your report and get back to you soon.",
      });
    }
  }, [formState.success]);

  React.useEffect(() => {
    setDescriptionLength(formState.values.description.length);
  }, [formState.values.description]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>
        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form action={formAction} id="bug-report-form">
          <FieldGroup>
            <Field data-invalid={!!formState.errors?.title?.length}>
              <FieldLabel htmlFor="title">Bug Title</FieldLabel>
              <Input
                aria-invalid={!!formState.errors?.title?.length}
                autoComplete="off"
                defaultValue={formState.values.title}
                disabled={pending}
                id="title"
                name="title"
                placeholder="Login button not working on mobile"
              />
              {formState.errors?.title && (
                <FieldError>{formState.errors.title[0]}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!formState.errors?.description?.length}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <InputGroup>
                <InputGroupTextarea
                  aria-invalid={!!formState.errors?.description?.length}
                  className="min-h-24 resize-none"
                  defaultValue={formState.values.description}
                  disabled={pending}
                  id="description"
                  name="description"
                  onChange={(e) => setDescriptionLength(e.target.value.length)}
                  placeholder="I'm having an issue with the login button on mobile."
                  rows={6}
                />
                <InputGroupAddon align="block-end">
                  <InputGroupText className="tabular-nums">
                    {descriptionLength}/100 characters
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldDescription>
                Include steps to reproduce, expected behavior, and what actually
                happened.
              </FieldDescription>
              {formState.errors?.description && (
                <FieldError>{formState.errors.description[0]}</FieldError>
              )}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button disabled={pending} form="bug-report-form" type="submit">
            {pending && <Spinner />}
            Submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
