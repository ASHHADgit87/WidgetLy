import { NextResponse } from "next/server";
import { getWidgetById } from "@/lib/db/widgets.repository";
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
  seedString: string,
): string {
  const configJson = JSON.stringify(config);
  const themeJson = JSON.stringify(theme);
  const apiBaseJson = JSON.stringify(apiBase);
  const seedJson = JSON.stringify(seedString);

  return `
(function () {
  var widgetId = ${JSON.stringify(config.id)};

  if (document.querySelector('[data-widget-rendered="' + widgetId + '"]')) {
    return;
  }

  var apiBase = ${apiBaseJson};
  var config = ${configJson};
  var theme = ${themeJson};
  var variantSeed = ${seedJson};
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
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid ' + theme.primary + '40',
        borderRadius: '10px',
        outline: 'none',
        position: 'relative',
        zIndex: '1',
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

  // Loads three.js from CDN exactly once per page, even if multiple
  // widgets are embedded — subsequent widgets reuse the same script tag.
  function loadThree(callback) {
    if (window.THREE) {
      callback();
      return;
    }
    var existing = document.querySelector('script[data-widget-three-loader]');
    if (existing) {
      existing.addEventListener('load', callback);
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.setAttribute('data-widget-three-loader', 'true');
    s.onload = callback;
    document.head.appendChild(s);
  }

  // Independent hash from the color-theme hash, so the background PATTERN
  // and the color THEME vary independently — clicking "new theme" changes
  // both, without them repeating the same pairing.
  function pickVariantIndex(seed, mod) {
    var hash = 0;
    for (var i = 0; i < seed.length; i++) {
      hash = (hash * 17 + seed.charCodeAt(i) + 7) >>> 0;
    }
    return hash % mod;
  }

  // --- Background variants: all low-opacity, particle/line-based, none
  // of them a large center-filling shape that could cross over fields. ---

  function buildAmbientDrift(THREE, scene, theme) {
    var count = 26;
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    var radii = [], angles = [], ys = [];
    for (var i = 0; i < count; i++) {
      var r = 1.6 + Math.random() * 1.6;
      var a = Math.random() * Math.PI * 2;
      var y = (Math.random() - 0.5) * 2.4;
      radii.push(r); angles.push(a); ys.push(y);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: theme.secondary, size: 0.035, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(geo, mat));
    var offset = angles.slice();
    return function (t, speed) {
      var arr = geo.attributes.position.array;
      for (var i = 0; i < count; i++) {
        offset[i] += 0.002 * speed;
        var a = angles[i] + offset[i];
        arr[i * 3] = Math.cos(a) * radii[i];
        arr[i * 3 + 2] = Math.sin(a) * radii[i];
      }
      geo.attributes.position.needsUpdate = true;
    };
  }

  function buildCornerOrbits(THREE, scene, theme) {
    var clusters = [
      { cx: -1.7, cy: 1.1, color: theme.primary },
      { cx: 1.7, cy: -1.1, color: theme.accent },
    ];
    var perCluster = 10;
    var items = [];
    clusters.forEach(function (cluster) {
      var geo = new THREE.BufferGeometry();
      var positions = new Float32Array(perCluster * 3);
      var radii = [], angles = [];
      for (var i = 0; i < perCluster; i++) {
        var r = 0.3 + Math.random() * 0.5;
        var a = Math.random() * Math.PI * 2;
        radii.push(r); angles.push(a);
        positions[i * 3] = cluster.cx + Math.cos(a) * r;
        positions[i * 3 + 1] = cluster.cy + Math.sin(a) * r;
        positions[i * 3 + 2] = 0;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var mat = new THREE.PointsMaterial({ color: cluster.color, size: 0.045, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending });
      scene.add(new THREE.Points(geo, mat));
      items.push({ geo: geo, radii: radii, angles: angles, cx: cluster.cx, cy: cluster.cy, offset: angles.slice() });
    });
    return function (t, speed) {
      items.forEach(function (c) {
        var arr = c.geo.attributes.position.array;
        for (var i = 0; i < perCluster; i++) {
          c.offset[i] += 0.004 * speed;
          var a = c.angles[i] + c.offset[i];
          arr[i * 3] = c.cx + Math.cos(a) * c.radii[i];
          arr[i * 3 + 1] = c.cy + Math.sin(a) * c.radii[i];
        }
        c.geo.attributes.position.needsUpdate = true;
      });
    };
  }

  function buildRisingMotes(THREE, scene, theme) {
    var count = 22;
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    var xs = [], speeds = [];
    for (var i = 0; i < count; i++) {
      var x = (Math.random() - 0.5) * 3.6;
      xs.push(x);
      speeds.push(0.15 + Math.random() * 0.2);
      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.random() * 4 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: theme.accent, size: 0.04, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending });
    scene.add(new THREE.Points(geo, mat));
    var progress = xs.map(function () { return Math.random(); });
    return function (t, speed) {
      var arr = geo.attributes.position.array;
      for (var i = 0; i < count; i++) {
        progress[i] += 0.0025 * speeds[i] * speed;
        if (progress[i] > 1) progress[i] -= 1;
        arr[i * 3 + 1] = -2 + progress[i] * 4;
        arr[i * 3] = xs[i] + Math.sin(progress[i] * Math.PI * 2) * 0.15;
      }
      geo.attributes.position.needsUpdate = true;
    };
  }

  function buildHorizonLines(THREE, scene, theme) {
    var colors = [theme.primary, theme.secondary, theme.accent];
    var items = [];
    var levels = [1.4, 0, -1.4];
    levels.forEach(function (y, idx) {
      var points = [];
      var segments = 24;
      for (var i = 0; i <= segments; i++) {
        points.push(new THREE.Vector3(-2.6 + (i / segments) * 5.2, y, 0));
      }
      var geo = new THREE.BufferGeometry().setFromPoints(points);
      var mat = new THREE.LineBasicMaterial({ color: colors[idx % colors.length], transparent: true, opacity: 0.15 });
      scene.add(new THREE.Line(geo, mat));
      items.push({ geo: geo, y: y, phase: idx * 1.3 });
    });
    return function (t, speed) {
      items.forEach(function (item) {
        var positions = item.geo.attributes.position;
        for (var i = 0; i < positions.count; i++) {
          var x = positions.getX(i);
          positions.setY(i, item.y + Math.sin(x * 0.9 + t * 1.2 + item.phase) * 0.12);
        }
        positions.needsUpdate = true;
      });
    };
  }

  function buildSoftBokeh(THREE, scene, theme) {
    var count = 9;
    var geo = new THREE.BufferGeometry();
    var positions = new Float32Array(count * 3);
    var radii = [], angles = [];
    for (var i = 0; i < count; i++) {
      var r = 1 + Math.random() * 1.8;
      var a = Math.random() * Math.PI * 2;
      radii.push(r); angles.push(a);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.6;
      positions[i * 3 + 2] = Math.sin(a) * r - 1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: theme.primary, size: 0.55, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(geo, mat));
    var offset = angles.slice();
    return function (t, speed) {
      var arr = geo.attributes.position.array;
      for (var i = 0; i < count; i++) {
        offset[i] += 0.0015 * speed;
        var a = angles[i] + offset[i];
        arr[i * 3] = Math.cos(a) * radii[i];
        arr[i * 3 + 2] = Math.sin(a) * radii[i] - 1;
      }
      geo.attributes.position.needsUpdate = true;
    };
  }

  function buildConstellationCorners(THREE, scene, theme) {
    var groups = [
      { cx: -1.8, cy: 1.3 },
      { cx: 1.8, cy: -1.3 },
    ];
    var perGroup = 5;
    var items = [];
    groups.forEach(function (g, gi) {
      var pts = [];
      for (var i = 0; i < perGroup; i++) {
        pts.push(new THREE.Vector3(g.cx + (Math.random() - 0.5) * 0.9, g.cy + (Math.random() - 0.5) * 0.9, 0));
      }
      var dotGeo = new THREE.BufferGeometry().setFromPoints(pts);
      var dotMat = new THREE.PointsMaterial({ color: theme.accent, size: 0.05, transparent: true, opacity: 0.28 });
      scene.add(new THREE.Points(dotGeo, dotMat));

      var linePts = [];
      for (var j = 0; j < pts.length - 1; j++) linePts.push(pts[j], pts[j + 1]);
      var lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      var lineMat = new THREE.LineBasicMaterial({ color: theme.secondary, transparent: true, opacity: 0.12 });
      scene.add(new THREE.LineSegments(lineGeo, lineMat));

      items.push({ dotGeo: dotGeo, basePts: pts, gi: gi });
    });
    return function (t, speed) {
      items.forEach(function (item) {
        var arr = item.dotGeo.attributes.position.array;
        for (var i = 0; i < item.basePts.length; i++) {
          arr[i * 3 + 1] = item.basePts[i].y + Math.sin(t * 0.8 + i + item.gi) * 0.05;
        }
        item.dotGeo.attributes.position.needsUpdate = true;
      });
    };
  }

  function buildVariant(THREE, scene, theme, index) {
    var builders = [
      buildAmbientDrift,
      buildCornerOrbits,
      buildRisingMotes,
      buildHorizonLines,
      buildSoftBokeh,
      buildConstellationCorners,
    ];
    return (builders[index] || builders[0])(THREE, scene, theme);
  }

  function renderAnimatedBackground(canvas, theme, seed) {
    loadThree(function () {
      var THREE = window.THREE;
      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      } catch (e) {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 6);

      function resize() {
        var w = canvas.clientWidth || canvas.parentNode.clientWidth;
        var h = canvas.clientHeight || canvas.parentNode.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);

      var variantIndex = pickVariantIndex(seed, 6);
      var update = buildVariant(THREE, scene, theme, variantIndex);

      var isHovered = false;
      var wrapper = canvas.parentNode;
      wrapper.addEventListener('mouseenter', function () { isHovered = true; });
      wrapper.addEventListener('mouseleave', function () { isHovered = false; });

      var speed = 1;
      var clock = 0;

      function draw() {
        var target = isHovered ? 1.8 : 1;
        speed += (target - speed) * 0.05;
        clock += 0.01 * speed;
        update(clock, speed);
        renderer.render(scene, camera);
      }

      if (prefersReducedMotion) {
        draw();
        return;
      }
      function loop() {
        draw();
        canvas._raf = requestAnimationFrame(loop);
      }
      canvas._raf = requestAnimationFrame(loop);
    });
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
    opacity: '0.55',
    pointerEvents: 'none',
    zIndex: '0',
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
    position: 'relative',
    zIndex: '1',
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
  renderAnimatedBackground(canvas, theme, variantSeed);
})();
`;
}

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;
  const widget = await getWidgetById(id);
  if (!widget || !widget.isActive) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Widget not found or inactive" },
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
  const seedString = (widget as any).themeSeed || themeSeedParam || widget.id;
  const theme = THEMES[hashToIndex(seedString, THEMES.length)]!;
  const apiBase = new URL(request.url).origin;

  const script = buildStandaloneScript(config, theme, apiBase, seedString);

  return new Response(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
