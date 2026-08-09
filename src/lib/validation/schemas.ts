import { z } from "zod";

export const widgetFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/, "Field name must be alphanumeric or underscore"),
  label: z.string().min(1).max(120),
  type: z.enum(["text", "email", "tel", "textarea", "checkbox"]),
  required: z.boolean(),
  placeholder: z.string().max(160).optional(),
});

export const widgetDisplayOptionsSchema = z.object({
  position: z
    .enum(["inline", "bottom-right", "bottom-left", "center-modal"])
    .optional(),
  theme: z.enum(["light", "dark"]).optional(),
  delaySeconds: z.number().int().min(0).max(120).optional(),
});

export const createWidgetSchema = z.object({
  type: z.enum([
    "SIGNUP_FORM",
    "CONTACT_FORM",
    "CTA_POPOVER",
    "NEWSLETTER_BAR",
    "EXIT_INTENT",
    "WAITLIST",
    "FEEDBACK_NPS",
    "CHAT_BUBBLE",
    "DISCOUNT_REVEAL",
    "EVENT_RSVP",
  ]),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  buttonText: z.string().min(1).max(40).default("Submit"),
  fields: z.array(widgetFieldSchema).min(1).max(12),
  displayOptions: widgetDisplayOptionsSchema.optional(),
});

export const updateWidgetSchema = createWidgetSchema.partial().extend({
  isActive: z.boolean().optional(),
  themeSeed: z.string().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(72),
});

export const submissionDataSchema = z
  .record(z.string(), z.union([z.string().max(2000), z.boolean()]))
  .refine((obj) => Object.keys(obj).length <= 20, {
    message: "Too many fields submitted",
  });

export const submissionPayloadSchema = z.object({
  widgetId: z.string().min(1).max(64),
  data: submissionDataSchema,
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  email: z.string().email().max(200).optional(),
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubmissionPayloadInput = z.infer<typeof submissionPayloadSchema>;
