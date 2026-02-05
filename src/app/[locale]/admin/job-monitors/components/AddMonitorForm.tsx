"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/app/[locale]/components/ui/button";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";

import { createJobSearchMonitor } from "@/actions/admin/job-monitors";
import {
  SITE_KEY_OPTIONS,
  LINKEDIN_LOCATION_OPTIONS,
  LINKEDIN_DATE_POSTED_OPTIONS,
} from "@/constants/job-monitor";
import { encodeLinkedInSearchUrl } from "@/lib/job-monitors/linkedin-params";

interface AddMonitorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddMonitorForm({ onSuccess, onCancel }: AddMonitorFormProps) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [siteKey, setSiteKey] = useState("hellowork");
  const [isAdding, setIsAdding] = useState(false);

  // LinkedIn-specific fields
  const [keywords, setKeywords] = useState("");
  const [locationId, setLocationId] = useState("105015875");
  const [datePosted, setDatePosted] = useState("pastWeek");

  const isLinkedIn = siteKey === "linkedin";

  const handleSubmit = async () => {
    if (!label.trim()) {
      toast.error("Label is required");
      return;
    }

    let searchUrl: string;

    if (isLinkedIn) {
      if (!keywords.trim()) {
        toast.error("Keywords are required for LinkedIn monitors");
        return;
      }
      searchUrl = encodeLinkedInSearchUrl({
        keywords: keywords.trim(),
        locationId,
        datePosted: datePosted as "pastMonth" | "past24Hours" | "pastWeek",
      });
    } else {
      if (!url.trim()) {
        toast.error("URL is required");
        return;
      }
      searchUrl = url.trim();
    }

    setIsAdding(true);
    try {
      await createJobSearchMonitor({
        label: label.trim(),
        search_url: searchUrl,
        site_key: siteKey,
      });
      toast.success("Monitor added");
      onSuccess();
    } catch (error) {
      console.error("Failed to add monitor:", error);
      toast.error("Failed to add monitor");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <h3 className="font-semibold">New Monitor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Label (e.g., HelloWork - Aromaticien)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Select value={siteKey} onValueChange={setSiteKey}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SITE_KEY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLinkedIn ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Keywords (e.g., aromaticien)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LINKEDIN_LOCATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={datePosted} onValueChange={setDatePosted}>
              <SelectTrigger>
                <SelectValue placeholder="Date posted" />
              </SelectTrigger>
              <SelectContent>
                {LINKEDIN_DATE_POSTED_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      ) : (
        <Input
          placeholder="Search URL (paste the full search results page URL)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      )}

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isAdding}>
          {isAdding ? "Adding..." : "Add Monitor"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
