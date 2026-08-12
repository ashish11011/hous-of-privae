"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LandingSettings = {
  navbarMessages: string[];
  landingBanners: {
    mobile: BannerItem[];
    desktop: BannerItem[];
  };
};

type BannerItem = {
  image: string;
  href?: string;
};

const emptySettings: LandingSettings = {
  navbarMessages: [""],
  landingBanners: {
    mobile: [{ image: "" }],
    desktop: [{ image: "" }],
  },
};

export default function SiteSettingsAdminPage() {
  const [settings, setSettings] = useState<LandingSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/admin/site-settings", { cache: "no-store" });
        const payload = await response.json();
        if (payload.data) setSettings(payload.data);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateNavbarMessage(index: number, value: string) {
    setSettings((current) => ({
      ...current,
      navbarMessages: current.navbarMessages.map((item, idx) =>
        idx === index ? value : item
      ),
    }));
  }

  function updateBanner(
    type: "desktop" | "mobile",
    index: number,
    field: keyof BannerItem,
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      landingBanners: {
        ...current.landingBanners,
        [type]: current.landingBanners[type].map((item, idx) =>
          idx === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  }

  function addItem(type: "navbar" | "desktop" | "mobile") {
    setSettings((current) => {
      if (type === "navbar") {
        return { ...current, navbarMessages: [...current.navbarMessages, ""] };
      }

      return {
        ...current,
        landingBanners: {
          ...current.landingBanners,
          [type]: [...current.landingBanners[type], { image: "" }],
        },
      };
    });
  }

  function removeItem(type: "navbar" | "desktop" | "mobile", index: number) {
    setSettings((current) => {
      if (type === "navbar") {
        return {
          ...current,
          navbarMessages: current.navbarMessages.filter((_, idx) => idx !== index),
        };
      }

      return {
        ...current,
        landingBanners: {
          ...current.landingBanners,
          [type]: current.landingBanners[type].filter((_, idx) => idx !== index),
        },
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to save settings.");
      }

      setMessage(payload.message || "Settings saved successfully.");
    } catch (error: any) {
      setMessage(error.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="w-full p-4 md:p-8">
        <p className="text-sm text-muted-foreground">Loading site settings...</p>
      </main>
    );
  }

  return (
    <main className="w-full p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage landing page banner images and the top navbar line.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border bg-card p-5 space-y-8 max-w-4xl">
        <SettingsList
          title="Top Navbar Line"
          label="Message"
          values={settings.navbarMessages}
          onChange={updateNavbarMessage}
          onAdd={() => addItem("navbar")}
          onRemove={(index) => removeItem("navbar", index)}
        />

        <BannerSettingsList
          title="Desktop Banner Images"
          values={settings.landingBanners.desktop}
          onChange={(index, field, value) => updateBanner("desktop", index, field, value)}
          onAdd={() => addItem("desktop")}
          onRemove={(index) => removeItem("desktop", index)}
        />

        <BannerSettingsList
          title="Mobile Banner Images"
          values={settings.landingBanners.mobile}
          onChange={(index, field, value) => updateBanner("mobile", index, field, value)}
          onAdd={() => addItem("mobile")}
          onRemove={(index) => removeItem("mobile", index)}
        />

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </main>
  );
}

function SettingsList({
  title,
  label,
  values,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus size={14} />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {values.map((value, index) => (
          <div className="grid grid-cols-[1fr_auto] gap-2" key={`${title}-${index}`}>
            <div className="space-y-2">
              <Label htmlFor={`${title}-${index}`}>{label} {index + 1}</Label>
              <Input
                id={`${title}-${index}`}
                value={value}
                onChange={(e) => onChange(index, e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="self-end"
              onClick={() => onRemove(index)}
              disabled={values.length === 1}
              aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BannerSettingsList({
  title,
  values,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  values: BannerItem[];
  onChange: (index: number, field: keyof BannerItem, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus size={14} />
          Add
        </Button>
      </div>

      <div className="space-y-4">
        {values.map((value, index) => (
          <div className="grid grid-cols-[1fr_auto] gap-2" key={`${title}-${index}`}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${title}-image-${index}`}>Image URL {index + 1}</Label>
                <Input
                  id={`${title}-image-${index}`}
                  value={value.image}
                  onChange={(e) => onChange(index, "image", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${title}-href-${index}`}>Redirect Link {index + 1}</Label>
                <Input
                  id={`${title}-href-${index}`}
                  value={value.href ?? ""}
                  placeholder="/category/loungewear"
                  onChange={(e) => onChange(index, "href", e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="self-end"
              onClick={() => onRemove(index)}
              disabled={values.length === 1}
              aria-label={`Remove banner ${index + 1}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
