"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Widget } from "@prisma/client";
import type { WidgetField } from "@/types";

interface WidgetFormProps {
  initialWidget?: Widget;
}

interface WidgetPreset {
  title: string;
  description: string;
  buttonText: string;
  fields: WidgetField[];
}

const TYPE_PRESETS: Record<Widget["type"], WidgetPreset> = {
  SIGNUP_FORM: {
    title: "Create your account",
    description: "Sign up to get started.",
    buttonText: "Sign up",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
  },
  CONTACT_FORM: {
    title: "Get in touch",
    description: "We'll get back to you within a day.",
    buttonText: "Send message",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
    ],
  },
  CTA_POPOVER: {
    title: "Don't miss out",
    description: "Join thousands already using the product.",
    buttonText: "Get started",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
  },
  NEWSLETTER_BAR: {
    title: "Stay in the loop",
    description: "One email a week, no spam.",
    buttonText: "Subscribe",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
  },
  EXIT_INTENT: {
    title: "Wait — before you go",
    description: "Get 10% off your first order.",
    buttonText: "Claim discount",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
  },
  WAITLIST: {
    title: "Join the waitlist",
    description: "Be first in line when we launch.",
    buttonText: "Join waitlist",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "company",
        label: "Company (optional)",
        type: "text",
        required: false,
      },
    ],
  },
  FEEDBACK_NPS: {
    title: "How are we doing?",
    description: "0 = not likely, 10 = extremely likely to recommend us.",
    buttonText: "Submit feedback",
    fields: [
      {
        name: "score",
        label: "Score (0–10)",
        type: "text",
        required: true,
        placeholder: "e.g. 9",
      },
      {
        name: "comments",
        label: "Anything else?",
        type: "textarea",
        required: false,
      },
    ],
  },
  CHAT_BUBBLE: {
    title: "Chat with us",
    description: "Usually reply within a few hours.",
    buttonText: "Start chat",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "message",
        label: "How can we help?",
        type: "textarea",
        required: true,
      },
    ],
  },
  DISCOUNT_REVEAL: {
    title: "Unlock your discount",
    description: "Enter your email to reveal your code.",
    buttonText: "Reveal code",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
  },
  EVENT_RSVP: {
    title: "RSVP now",
    description: "Let us know if you're joining.",
    buttonText: "RSVP",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      {
        name: "attending",
        label: "I'll be attending",
        type: "checkbox",
        required: false,
      },
      {
        name: "guests",
        label: "Number of guests",
        type: "text",
        required: false,
        placeholder: "e.g. 2",
      },
    ],
  },
};

const typeOptions: { value: Widget["type"]; label: string }[] = [
  { value: "SIGNUP_FORM", label: "Signup form" },
  { value: "CONTACT_FORM", label: "Contact form" },
  { value: "CTA_POPOVER", label: "CTA popover" },
  { value: "NEWSLETTER_BAR", label: "Newsletter bar" },
  { value: "EXIT_INTENT", label: "Exit-intent popup" },
  { value: "WAITLIST", label: "Waitlist" },
  { value: "FEEDBACK_NPS", label: "Feedback / NPS" },
  { value: "CHAT_BUBBLE", label: "Chat bubble" },
  { value: "DISCOUNT_REVEAL", label: "Discount reveal" },
  { value: "EVENT_RSVP", label: "Event RSVP" },
];

function serialize(
  type: Widget["type"],
  title: string,
  description: string,
  buttonText: string,
  fields: WidgetField[],
) {
  return JSON.stringify({ type, title, description, buttonText, fields });
}

export function WidgetForm({ initialWidget }: WidgetFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialWidget);

  const initialType: Widget["type"] = initialWidget?.type ?? "SIGNUP_FORM";
  const initialPreset = TYPE_PRESETS[initialType];

  const [title, setTitle] = useState(
    initialWidget?.title ?? initialPreset.title,
  );
  const [description, setDescription] = useState(
    initialWidget?.description ?? initialPreset.description,
  );
  const [type, setType] = useState<Widget["type"]>(initialType);
  const [buttonText, setButtonText] = useState(
    initialWidget?.buttonText ?? initialPreset.buttonText,
  );
  const [fields, setFields] = useState<WidgetField[]>(
    (initialWidget?.fields as WidgetField[] | undefined) ??
      initialPreset.fields,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    serialize(initialType, title, description, buttonText, fields),
  );

  const isDirty = useMemo(
    () =>
      serialize(type, title, description, buttonText, fields) !== savedSnapshot,
    [type, title, description, buttonText, fields, savedSnapshot],
  );

  function handleTypeChange(nextType: Widget["type"]) {
    setType(nextType);
    const preset = TYPE_PRESETS[nextType];
    setTitle(preset.title);
    setDescription(preset.description);
    setButtonText(preset.buttonText);
    setFields(preset.fields);
  }

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

    setSavedSnapshot(serialize(type, title, description, buttonText, fields));

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
          onChange={(e) => handleTypeChange(e.target.value as Widget["type"])}
          className="w-full rounded-md border border-[#4b2b82] bg-[#1a0525] px-3 py-2 text-sm text-white outline-none focus:border-[#9e78ff]"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-white/30">
          Changing type replaces the title, description, and fields below with
          suggested defaults for that type.
        </p>
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

      {(!isEditing || isDirty) && (
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : isEditing
              ? "Save changes"
              : "Create widget"}
        </Button>
      )}
    </form>
  );
}
