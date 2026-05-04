// Placeholder for module pages that haven't been implemented yet. Keeps the
// nav navigable end-to-end during scaffolding so we can validate routing
// before writing each module's real UI.
export default function Placeholder({ title, description }) {
  return (
    <div className="border border-dashed border-white/[0.08] p-10 text-center text-neutral-500">
      <h2 className="text-sm uppercase tracking-[0.18em] text-neutral-400 mb-2">
        {title}
      </h2>
      <p className="text-xs text-neutral-600 max-w-md mx-auto">
        {description ||
          "Coming soon. See ADMIN_PANEL_SPEC.md for the planned features in this module."}
      </p>
    </div>
  );
}
