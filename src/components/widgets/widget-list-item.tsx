import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { WidgetOrb } from "@/components/three/widget-orb";
import type { Widget } from "@prisma/client";

interface WidgetListItemProps {
  widget: Widget;
}

const typeLabels: Record<Widget["type"], string> = {
  SIGNUP_FORM: "Signup form",
  CONTACT_FORM: "Contact form",
  CTA_POPOVER: "CTA popover",
  NEWSLETTER_BAR: "Newsletter bar",
  EXIT_INTENT: "Exit-intent popup",
  WAITLIST: "Waitlist",
  FEEDBACK_NPS: "Feedback / NPS",
  CHAT_BUBBLE: "Chat bubble",
  DISCOUNT_REVEAL: "Discount reveal",
  EVENT_RSVP: "Event RSVP",
};

export function WidgetListItem({ widget }: WidgetListItemProps) {
  return (
    <Link href={`/widgets/${widget.id}`}>
      <Card className="border-[#5b2f99] bg-[#15072d]/70 transition hover:border-[#8d5cff]/60 hover:shadow-[0_16px_50px_rgba(139,92,255,0.15)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WidgetOrb />
            <div>
              <p className="text-sm font-medium text-white">{widget.title}</p>
              <p className="mt-1 text-xs text-white/40">
                {typeLabels[widget.type]}
              </p>
            </div>
          </div>
          <Badge variant={widget.isActive ? "success" : "default"}>
            {widget.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
