import { FRAMEWORK_PRESETS } from "../../shared/constants";

interface Props {
  activeFramework: string | null;
  onChange: (frameworkId: string | null) => void;
}

export function FrameworkSelector({ activeFramework, onChange }: Props) {
  return (
    <div className="framework-selector">
      <div className="framework-selector__label">Framework preset</div>
      <div className="framework-selector__buttons">
        <button
          className={`framework-btn ${activeFramework === null ? "framework-btn--active" : ""}`}
          onClick={() => onChange(null)}
        >
          None
        </button>
        {Object.values(FRAMEWORK_PRESETS).map((preset) => (
          <button
            key={preset.id}
            className={`framework-btn ${activeFramework === preset.id ? "framework-btn--active" : ""}`}
            onClick={() => onChange(activeFramework === preset.id ? null : preset.id)}
            title={`${preset.name} by ${preset.author}`}
          >
            {preset.name}
          </button>
        ))}
      </div>
      {activeFramework && FRAMEWORK_PRESETS[activeFramework] && (
        <div className="framework-selector__meta">
          {FRAMEWORK_PRESETS[activeFramework].classes.length} classes protected
          <span className="framework-selector__author">
            by {FRAMEWORK_PRESETS[activeFramework].author}
          </span>
        </div>
      )}
    </div>
  );
}
