type InternalRuntimePanelProps = {
  apiStatus?: 'online' | 'warning' | 'offline'
  deployStatus?: 'stable' | 'updating' | 'attention'
  runtimeWarnings?: number
}

export function InternalRuntimePanel({
  apiStatus = 'online',
  deployStatus = 'stable',
  runtimeWarnings = 0,
}: InternalRuntimePanelProps) {
  return (
    <section className="lv-internal-runtime-panel">
      <header className="lv-internal-runtime-panel__header">
        <div>
          <p className="lv-internal-runtime-panel__eyebrow">Internal Runtime</p>
          <h3 className="lv-internal-runtime-panel__title">System Visibility</h3>
        </div>

        <span className="lv-internal-runtime-panel__badge">Internal</span>
      </header>

      <div className="lv-internal-runtime-panel__grid">
        <article className="lv-internal-runtime-panel__item">
          <span>API</span>
          <strong>{apiStatus}</strong>
        </article>

        <article className="lv-internal-runtime-panel__item">
          <span>Deploy</span>
          <strong>{deployStatus}</strong>
        </article>

        <article className="lv-internal-runtime-panel__item">
          <span>Warnings</span>
          <strong>{runtimeWarnings}</strong>
        </article>
      </div>
    </section>
  )
}
