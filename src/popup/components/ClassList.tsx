interface Props {
  classes: string[];
  onRemove: (className: string) => void;
}

export function ClassList({ classes, onRemove }: Props) {
  if (classes.length === 0) {
    return (
      <div className="class-list class-list--empty">
        <span className="class-list__empty-icon">🔓</span>
        <p className="class-list__empty-text">No classes protected yet.</p>
        <p className="class-list__empty-hint">
          Add one below, or right-click a class pill in the Designer.
        </p>
      </div>
    );
  }

  return (
    <ul className="class-list">
      {classes.map((cls) => (
        <li key={cls} className="class-list__item">
          <span className="class-list__icon">🔒</span>
          <span className="class-list__name">.{cls}</span>
          <button
            className="class-list__remove"
            onClick={() => onRemove(cls)}
            title={`Unprotect .${cls}`}
            aria-label={`Remove ${cls}`}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
