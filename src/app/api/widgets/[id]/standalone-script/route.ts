import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWidgetForTenant } from "@/lib/db/widgets.repository";
import type { WidgetPublicConfig } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const THEMES = [
  {
    primary: "#8b5cf6",
    secondary: "#6366f1",
    accent: "#22d3ee",
    bgFrom: "#0f0a2e",
    bgTo: "#1e1147",
    text: "#f5f3ff",
    muted: "#c4b5fd",
  },
  {
    primary: "#f97316",
    secondary: "#ec4899",
    accent: "#facc15",
    bgFrom: "#1f0a1a",
    bgTo: "#3d0f24",
    text: "#fff7ed",
    muted: "#fdba74",
  },
  {
    primary: "#10b981",
    secondary: "#059669",
    accent: "#a3e635",
    bgFrom: "#04120d",
    bgTo: "#062018",
    text: "#ecfdf5",
    muted: "#6ee7b7",
  },
  {
    primary: "#3b82f6",
    secondary: "#6366f1",
    accent: "#f472b6",
    bgFrom: "#050b1f",
    bgTo: "#0b1740",
    text: "#eff6ff",
    muted: "#93c5fd",
  },
  {
    primary: "#ef4444",
    secondary: "#f97316",
    accent: "#fde047",
    bgFrom: "#1a0505",
    bgTo: "#2e0a0a",
    text: "#fef2f2",
    muted: "#fca5a5",
  },
  {
    primary: "#d946ef",
    secondary: "#a855f7",
    accent: "#67e8f9",
    bgFrom: "#170a29",
    bgTo: "#2b0f45",
    text: "#fdf4ff",
    muted: "#e9a8fd",
  },
  {
    primary: "#06b6d4",
    secondary: "#0ea5e9",
    accent: "#e0e7ff",
    bgFrom: "#04141c",
    bgTo: "#062534",
    text: "#ecfeff",
    muted: "#67e8f9",
  },
  {
    primary: "#eab308",
    secondary: "#f59e0b",
    accent: "#fb923c",
    bgFrom: "#1c1505",
    bgTo: "#332608",
    text: "#fffbeb",
    muted: "#fde68a",
  },
] as const;

function hashToIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

function buildStandaloneScript(
  config: WidgetPublicConfig,
  theme: (typeof THEMES)[number],
  apiBase: string,
): string {
  const configJson = JSON.stringify(config);
  const themeJson = JSON.stringify(theme);
  const apiBaseJson = JSON.stringify(apiBase);

  return `
(function () {
  var widgetId = ${JSON.stringify(config.id)};

  if (document.querySelector('[data-widget-rendered="' + widgetId + '"]')) {
    return;
  }

  var apiBase = ${apiBaseJson};
  var config = ${configJson};
  var theme = ${themeJson};
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, styles, attrs) {
    var node = document.createElement(tag);
    if (styles) Object.assign(node.style, styles);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    return node;
  }

  function buildField(field, theme) {
    var wrapper = el('div', { marginBottom: '14px' });

    var label = el('label', {
      display: 'block',
      fontSize: '12px',
      fontWeight: '600',
      letterSpacing: '0.03em',
      textTransform: 'uppercase',
      color: theme.muted,
      marginBottom: '6px',
    });
    label.textContent = field.label;

    var input;
    if (field.type === 'textarea') {
      input = el('textarea', { minHeight: '80px', resize: 'vertical' });
    } else if (field.type === 'checkbox') {
      input = el('input');
      input.type = 'checkbox';
      input.style.accentColor = theme.primary;
      input.style.width = '16px';
      input.style.height = '16px';
    } else {
      input = el('input');
      input.type = field.type;
    }
    input.name = field.name;
    if (field.required) input.required = true;
    if (field.placeholder) input.setAttribute('placeholder', field.placeholder);

    if (field.type !== 'checkbox') {
      Object.assign(input.style, {
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        fontSize: '14px',
        fontFamily: 'inherit',
        color: theme.text,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid ' + theme.primary + '40',
        borderRadius: '10px',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      });
      input.addEventListener('focus', function () {
        input.style.borderColor = theme.primary;
        input.style.boxShadow = '0 0 0 3px ' + theme.primary + '2a';
      });
      input.addEventListener('blur', function () {
        input.style.borderColor = theme.primary + '40';
        input.style.boxShadow = 'none';
      });
      wrapper.appendChild(label);
      wrapper.appendChild(input);
    } else {
      var row = el('div', { display: 'flex', alignItems: 'center', gap: '8px' });
      row.appendChild(input);
      row.appendChild(label);
      label.style.marginBottom = '0';
      label.style.textTransform = 'none';
      label.style.fontSize = '13px';
      wrapper.appendChild(row);
    }

    return wrapper;
  }

  function renderAnimatedBackground(canvas, theme) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var orbs = [
      { x: 0.2, y: 0.3, r: 0.5, color: theme.primary, dx: 0.00012, dy: 0.00009 },
      { x: 0.8, y: 0.7, r: 0.45, color: theme.secondary, dx: -0.00010, dy: 0.00011 },
      { x: 0.5, y: 0.15, r: 0.35, color: theme.accent, dx: 0.00008, dy: -0.00010 },
    ];

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(function (orb) {
        var cx = (orb.x + Math.sin(t * orb.dx) * 0.15) * w;
        var cy = (orb.y + Math.cos(t * orb.dy) * 0.15) * h;
        var r = orb.r * Math.max(w, h);
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, orb.color + '55');
        grad.addColorStop(1, orb.color + '00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    if (prefersReducedMotion) {
      draw(0);
      return;
    }

    function loop(now) {
      draw(now);
      canvas._raf = requestAnimationFrame(loop);
    }
    canvas._raf = requestAnimationFrame(loop);
  }

  var container = el('div', {
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    maxWidth: '380px',
    padding: '26px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, ' + theme.bgFrom + ', ' + theme.bgTo + ')',
    boxShadow: '0 24px 60px -12px ' + theme.primary + '55, 0 0 0 1px ' + theme.primary + '25',
  }, { 'data-widget-rendered': widgetId });

  var canvas = el('canvas', {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    opacity: '0.7',
    pointerEvents: 'none',
  });
  container.appendChild(canvas);

  var content = el('div', { position: 'relative', zIndex: '1' });

  var title = el('h3', {
    margin: '0 0 6px 0',
    fontSize: '19px',
    fontWeight: '700',
    color: theme.text,
    letterSpacing: '-0.01em',
  });
  title.textContent = config.title;
  content.appendChild(title);

  if (config.description) {
    var desc = el('p', {
      margin: '0 0 18px 0',
      fontSize: '13px',
      lineHeight: '1.5',
      color: theme.muted,
    });
    desc.textContent = config.description;
    content.appendChild(desc);
  } else {
    content.style.marginBottom = '4px';
  }

  var form = el('form');

  if (!config.fields || config.fields.length === 0) {
    var fallback = el('p', { fontSize: '13px', color: theme.muted, marginBottom: '14px' });
    fallback.textContent = 'Contact us using the button below.';
    form.appendChild(fallback);
  } else {
    config.fields.forEach(function (field) {
      form.appendChild(buildField(field, theme));
    });
  }

  var honeypot = el('input', {
    position: 'absolute',
    left: '-9999px',
  });
  honeypot.type = 'text';
  honeypot.name = config.honeypotFieldName;
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');
  form.appendChild(honeypot);

  var submitBtn = el('button', {
    marginTop: '4px',
    width: '100%',
    padding: '11px 18px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0d0116',
    background: 'linear-gradient(120deg, ' + theme.primary + ', ' + theme.secondary + ')',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  });
  submitBtn.type = 'submit';
  submitBtn.textContent = config.buttonText;
  submitBtn.addEventListener('mouseenter', function () {
    submitBtn.style.transform = 'translateY(-1px)';
    submitBtn.style.boxShadow = '0 8px 24px -6px ' + theme.primary + '90';
  });
  submitBtn.addEventListener('mouseleave', function () {
    submitBtn.style.transform = 'none';
    submitBtn.style.boxShadow = 'none';
  });
  form.appendChild(submitBtn);

  var statusMsg = el('p', {
    fontSize: '13px',
    marginTop: '10px',
    marginBottom: '0',
    minHeight: '18px',
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (submitBtn.disabled) return;

    var formData = new FormData(form);
    var payloadData = {};
    formData.forEach(function (value, key) {
      payloadData[key] = value;
    });

    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'not-allowed';
    statusMsg.textContent = '';

    fetch(apiBase + '/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetId: widgetId, data: payloadData }),
    })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, json: j }; }); })
      .then(function (result) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';

        if (result.json.success) {
          statusMsg.style.color = theme.accent;
          statusMsg.textContent = 'Thank you — we received your message.';
          form.reset();
        } else if (result.json.error && result.json.error.code === 'RATE_LIMITED') {
          statusMsg.style.color = '#fca5a5';
          statusMsg.textContent = 'Too many attempts — please wait a moment and try again.';
        } else if (result.json.error && result.json.error.code === 'VALIDATION_ERROR') {
          statusMsg.style.color = '#fca5a5';
          statusMsg.textContent = 'Please check your entries and try again.';
        } else {
          statusMsg.style.color = '#fca5a5';
          statusMsg.textContent = 'Something went wrong. Please try again.';
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        statusMsg.style.color = '#fca5a5';
        statusMsg.textContent = 'Network error — please check your connection and try again.';
      });
  });

  content.appendChild(form);
  content.appendChild(statusMsg);
  container.appendChild(content);

  document.currentScript.parentNode.insertBefore(container, document.currentScript.nextSibling);
  renderAnimatedBackground(canvas, theme);
})();
`;
}

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Sign in required" },
      },
      { status: 401 },
    );
  }

  const { id } = await params;
  const widget = await getWidgetForTenant(id, userId);
  if (!widget) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Widget not found" },
      },
      { status: 404 },
    );
  }

  const config: WidgetPublicConfig = {
    id: widget.id,
    type: widget.type,
    title: widget.title,
    description: widget.description,
    buttonText: widget.buttonText,
    fields: widget.fields as unknown as WidgetPublicConfig["fields"],
    displayOptions:
      widget.displayOptions as WidgetPublicConfig["displayOptions"],
    honeypotFieldName: widget.honeypotFieldName,
    bundleVersion: widget.bundleVersion,
  };

  const themeSeedParam = new URL(request.url).searchParams.get("themeSeed");
  const theme =
    THEMES[hashToIndex(themeSeedParam || widget.id, THEMES.length)]!;
  const apiBase = new URL(request.url).origin;

  const script = buildStandaloneScript(config, theme, apiBase);

  return new Response(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
