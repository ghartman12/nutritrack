"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";

interface SettingsData {
  calorieGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  weightUnit: string;
  activityLevel: string;
  llmProvider: string;
}

interface SettingsFormProps {
  initialData: SettingsData;
  onSave: (data: SettingsData) => Promise<void>;
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "very_active", label: "Very Active" },
];

export default function SettingsForm({ initialData, onSave }: SettingsFormProps) {
  const [data, setData] = useState<SettingsData>(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (field: string, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(data);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Daily Goals</h3>
        <Input
          label="Calorie Goal"
          type="number"
          value={data.calorieGoal}
          onChange={(e) => update("calorieGoal", parseInt(e.target.value) || 0)}
        />
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Protein (g)"
            type="number"
            value={data.proteinTarget}
            onChange={(e) => update("proteinTarget", parseInt(e.target.value) || 0)}
          />
          <Input
            label="Carbs (g)"
            type="number"
            value={data.carbTarget}
            onChange={(e) => update("carbTarget", parseInt(e.target.value) || 0)}
          />
          <Input
            label="Fat (g)"
            type="number"
            value={data.fatTarget}
            onChange={(e) => update("fatTarget", parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Preferences</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight Unit</label>
          <div className="flex gap-3">
            {["lbs", "kg"].map((unit) => (
              <button
                key={unit}
                onClick={() => update("weightUnit", unit)}
                className={`flex-1 py-2.5 rounded-xl border-2 font-medium transition-colors ${
                  data.weightUnit === unit
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {unit.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
          <select
            value={data.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {activityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
              <select
                value={data.llmProvider}
                onChange={(e) => update("llmProvider", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="claude">Claude (Anthropic)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
      </button>
    </div>
  );
}
