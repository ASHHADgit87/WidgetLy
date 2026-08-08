"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Widget } from "@prisma/client";
import type { WidgetField } from "@/types";

interface WidgetFormProps {
  initialWidget?: Widget;
}

const defaultField: WidgetField = {
  name: "email",
  label: "Email",
  type: "email",
  required: true,
};

export function WidgetForm({ initialWidget }: WidgetFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialWidget);

  const [title, setTitle] = useState(initialWidget?.title ?? "");
  const [description, setDescription] = useState(
    initialWidget?.description ?? "",
  );
  const [type, setType] = useState<Widget["type"]>(
    initialWidget?.type ?? "SIGNUP_FORM",
  );
  const [buttonText, setButtonText] = useState(
    initialWidget?.buttonText ?? "Submit",
  );
  const [fields, setFields] = useState<WidgetField[]>(
    (initialWidget?.fields as WidgetField[] | undefined) ?? [defaultField],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(index: number, patch: Partial<WidgetField>) {
    setFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    );
  }

  function addField() {
    setFields((prev) => [
      ...prev,
      {
        name: `field_${prev.length + 1}`,
        label: "New field",
        type: "text",
        required: false,
      },
    ]);
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = { type, title, description, buttonText, fields };
    const url = isEditing
      ? `/api/widgets/${initialWidget!.id}`
      : "/api/widgets";
    const method = isEditing ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setIsSubmitting(false);

    if (!json.success) {
      if (json.error?.code === "WIDGET_LIMIT_REACHED") {
        setError(
          "You've reached the 10-widget limit for your account. Delete an existing widget to create a new one.",
        );
      } else {
        setError(json.error?.message ?? "Failed to save widget.");
      }
      return;
    }

    router.push(
      isEditing ? `/widgets/${initialWidget!.id}` : `/widgets/${json.data.id}`,
    );
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-md border border-[#5b2f99] bg-[#2a0a3d]/60 px-3 py-2 text-sm text-[#ff9d9d]">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm text-white/60">Widget type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Widget["type"])}
          className="w-full rounded-md border border-[#4b2b82] bg-[#1a0525] px-3 py-2 text-sm text-white outline-none focus:border-[#9e78ff]"
        >
          <option value="SIGNUP_FORM">Signup form</option>
          <option value="CONTACT_FORM">Contact form</option>
          <option value="CTA_POPOVER">CTA popover</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/60">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/60">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-white/60">Button text</label>
        <Input
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          maxLength={40}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-white/60">Fields</label>
          <Button type="button" size="sm" variant="primary" onClick={addField}>
            Add field
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 rounded-md border border-[#4b2b82] bg-[#15072d]/50 p-3"
            >
              <Input
                className="col-span-4"
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
                placeholder="field_name"
              />
              <Input
                className="col-span-4"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Label"
              />
              <select
                className="col-span-3 rounded-md border border-[#4b2b82] bg-[#1a0525] px-2 py-2 text-sm text-white"
                value={field.type}
                onChange={(e) =>
                  updateField(index, {
                    type: e.target.value as WidgetField["type"],
                  })
                }
              >
                <option value="text">text</option>
                <option value="email">email</option>
                <option value="tel">tel</option>
                <option value="textarea">textarea</option>
                <option value="checkbox">checkbox</option>
              </select>
              <button
                type="button"
                onClick={() => removeField(index)}
                className="col-span-1 text-xs text-[#ff9d9d] hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving…"
          : isEditing
            ? "Save changes"
            : "Create widget"}
      </Button>
    </form>
  );
}
