import Link from "next/link";
import type { ReactElement } from "react";

import { CookedQuizClient } from "./_client/cooked-quiz-client";

// source-size: reason=one server-rendered acquisition document preserves static parity
export default function HomePage(): ReactElement {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip the founder lore
      </a>

      <header className="site-header" aria-label="Primary">
        <Link className="wordmark" href="/" aria-label="Fuck My Cofounder home">
          <span className="wordmark__mark" aria-hidden="true">
            F/MC
          </span>
          <span className="wordmark__text">Fuck My Cofounder</span>
        </Link>
        <div className="header-status">
          <span aria-hidden="true" /> definitely not legal advice
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">
            Some startups need a pivot.
            <br />
            <em>Some need an exorcism.</em>
          </h1>
          <div className="hero__lower">
            <p className="hero__lede">
              Convert founder chaos into a completely unofficial, aggressively
              redacted incident report. No account. Optional mugshot. No names.
            </p>
            <p className="hero__case" aria-hidden="true">
              CASE NO. <span data-case-ticker>000001</span>
              <br />
              VIBES JURISDICTION
            </p>
          </div>
        </section>

        <section className="mode-picker" aria-labelledby="mode-title">
          <div className="section-heading">
            <p className="eyebrow">SELECT YOUR COPING MECHANISM</p>
            <h2 id="mode-title">How cooked are we?</h2>
          </div>

          <div className="mode-grid">
            <article
              className="mode-card mode-card--report"
              aria-labelledby="report-title"
            >
              <div className="mode-card__meta">
                <span>MODE 01</span>
                <span>NO LOGIN / OPTIONAL MUGSHOT</span>
              </div>
              <div>
                <h3 id="report-title">
                  File an
                  <br />
                  Incident Report
                </h3>
                <p>
                  Tell the story without telling on anyone. Receive the board
                  disposition you deserve.
                </p>
              </div>
              <button
                className="button button--dark"
                type="button"
                data-start-report
              >
                Begin emotional paperwork <span aria-hidden="true">↗</span>
              </button>
            </article>

            <article
              className="mode-card mode-card--spicy"
              aria-labelledby="spicy-title"
            >
              <div className="mode-card__meta">
                <span>MODE 02</span>
                <span className="classified">CLASSIFIED</span>
              </div>
              <div>
                <h3 id="spicy-title">
                  Spicy
                  <br />
                  Mode
                </h3>
                <p>
                  For when the cap-table fight is really about who sits next to
                  the ABG CMO at offsite.
                </p>
              </div>
              <button
                className="button button--disabled"
                type="button"
                disabled
              >
                Coming soon-ish <span aria-hidden="true">↗</span>
              </button>
              <div className="mode-card__tape" aria-hidden="true">
                LAWYERS SAID “ABSOLUTELY NOT YET”
              </div>
            </article>
          </div>
        </section>

        <section className="process" aria-labelledby="process-title">
          <p className="eyebrow">THE THREE-STAGE GRIEF PIPELINE</p>
          <h2 id="process-title">Vent. Redact. Release.</h2>
          <ol className="process__steps">
            <li>
              <span>01</span>
              <strong>Pick the charge</strong>
              <small>
                Equity amnesia? Pivot addiction? Weaponized “quick sync”?
              </small>
            </li>
            <li>
              <span>02</span>
              <strong>Remove the identifiers</strong>
              <small>
                No names, handles, links, companies, or courtroom exhibits.
              </small>
            </li>
            <li>
              <span>03</span>
              <strong>Share the case file</strong>
              <small>
                Download the card or send a link with the mugshot attached.
              </small>
            </li>
          </ol>
        </section>

        <section
          className="board-entry"
          aria-labelledby="board-entry-title"
          data-board-entry
        >
          <div className="board-entry__copy">
            <p className="eyebrow">PUBLIC RECORD / VIBES JURISDICTION</p>
            <h2 id="board-entry-title">The Town Board</h2>
            <p>
              Live filings stay on the static production board. This local
              report stays in your browser; visit the docket to read it.
            </p>
          </div>
          <div className="board-entry__actions">
            <a className="button button--red" href="/board">
              Visit the Town Board <span aria-hidden="true">→</span>
            </a>
            <form className="board-entry__reclaim" data-board-entry-reclaim>
              <label className="board-entry__label" htmlFor="landing-board-key">
                Returning? Enter your board key
              </label>
              <div className="board-entry__row">
                <input
                  id="landing-board-key"
                  className="board-entry__input"
                  name="boardKey"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="FMC-ABC2345"
                  maxLength={20}
                  data-board-entry-input
                />
                <button className="button button--outline" type="submit">
                  Unseal
                </button>
              </div>
              <p
                className="board-entry__error"
                data-board-entry-error
                role="status"
                aria-live="polite"
              />
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>
          © <span data-year /> FUCKMYCOFOUNDER.COM
        </p>
      </footer>

      <ReportDialog />
      <CookedQuizClient />

      <noscript>
        <div className="noscript">
          This emotional paperwork requires JavaScript. Your cofounder has
          already disabled enough things.
        </div>
      </noscript>
    </>
  );
}

function ReportDialog() {
  return (
    <dialog
      className="report-dialog"
      data-report-dialog
      aria-labelledby="dialog-title"
    >
      <div className="report-shell">
        <header className="report-header">
          <div>
            <p className="eyebrow">OFFICE OF FOUNDER AFFAIRS</p>
            <h2 id="dialog-title">Cofounder Incident Report</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            data-close-report
            aria-label="Close report"
          >
            ×
          </button>
        </header>

        <div className="step-meter" aria-label="Report progress">
          <span data-meter="1" className="is-active">
            1. Charge
          </span>
          <span data-meter="2">2. Statement</span>
          <span data-meter="3">3. Case file</span>
        </div>

        <form className="report-form" data-report-form noValidate>
          <section
            className="form-step is-active"
            data-step="1"
            aria-labelledby="step-one-title"
          >
            <p className="form-kicker">SECTION A / NATURE OF THE NONSENSE</p>
            <h3 id="step-one-title">What are we charging the vibes with?</h3>
            <fieldset className="charge-grid" data-charge-grid>
              <legend className="sr-only">Choose one cofounder offense</legend>
            </fieldset>
            <p className="field-error" data-charge-error role="alert" />
            <div className="form-actions form-actions--end">
              <button
                className="button button--red"
                type="button"
                data-next="2"
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>

          <section
            className="form-step"
            data-step="2"
            aria-labelledby="step-two-title"
            hidden
          >
            <p className="form-kicker">SECTION B / THE HEAVILY REDACTED LORE</p>
            <h3 id="step-two-title">Give us the board-safe version.</h3>
            <div className="avatar-field">
              <div className="avatar-field__header">
                <span>Subject photo (optional)</span>
                <button
                  className="text-button"
                  type="button"
                  data-avatar-clear
                  hidden
                >
                  Remove
                </button>
              </div>
              <div className="avatar-field__body">
                <label className="avatar-picker">
                  <input
                    type="file"
                    data-avatar-input
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <span>Add mugshot</span>
                </label>
                {/* Blob URLs stay local and cannot use Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="avatar-preview"
                  data-avatar-preview
                  alt=""
                  hidden
                />
              </div>
              <p className="field-error" data-avatar-error role="alert" />
            </div>
            <label className="field">
              <span>My cofounder…</span>
              <textarea
                name="incident"
                rows={3}
                maxLength={180}
                required
                placeholder="called a 6 a.m. all-hands to unveil the exact idea we rejected yesterday"
              />
              <small>
                <span data-count="incident">0</span>/180
              </small>
              <span
                className="field-error"
                data-error="incident"
                role="alert"
              />
            </label>
            <div className="case-preview" data-case-preview-wrap hidden>
              <p className="form-kicker">LIVE CASE FILE PREVIEW</p>
              <CaseFile preview />
            </div>
            <label className="field">
              <span>When asked about it, they said…</span>
              <textarea
                name="quote"
                rows={2}
                maxLength={140}
                required
                placeholder="we need to move at the speed of trust"
              />
              <small>
                <span data-count="quote">0</span>/140
              </small>
              <span className="field-error" data-error="quote" role="alert" />
            </label>
            <label className="field">
              <span>Sane adults might call this…</span>
              <input
                name="translation"
                type="text"
                maxLength={80}
                required
                placeholder="calendar-based psychological warfare"
              />
              <small>
                <span data-count="translation">0</span>/80
              </small>
              <span
                className="field-error"
                data-error="translation"
                role="alert"
              />
            </label>
            <div className="form-actions">
              <button
                className="button button--outline"
                type="button"
                data-back="1"
              >
                ← Back
              </button>
              <button className="button button--red" type="submit">
                Generate case file ↗
              </button>
            </div>
          </section>

          <section
            className="form-step"
            data-step="3"
            aria-labelledby="step-three-title"
            hidden
          >
            <div className="result-heading">
              <div>
                <p className="form-kicker">SECTION C / OFFICIAL-ISH FINDINGS</p>
                <h3 id="step-three-title">The board has seen enough.</h3>
              </div>
              <button className="text-button" type="button" data-start-over>
                Start over
              </button>
            </div>
            <CaseFile />
            <div className="share-actions">
              <button
                className="button button--red"
                type="button"
                data-share-report
              >
                Share the evidence
              </button>
              <button
                className="button button--outline"
                type="button"
                data-download-report
              >
                Download card
              </button>
              <button
                className="button button--outline"
                type="button"
                data-copy-link
              >
                Copy private-ish link
              </button>
            </div>
            <p className="share-note">
              *Sharing creates a private-ish fragment link. It does not publish
              a Town Board filing. Still no names, still satire.
            </p>
            <div
              className="toast"
              data-toast
              role="status"
              aria-live="polite"
            />
          </section>
        </form>
      </div>
    </dialog>
  );
}

function CaseFile({ preview = false }: { readonly preview?: boolean }) {
  return (
    <article
      className="case-file"
      {...(preview
        ? { "data-case-preview": true }
        : { "data-case-file": true })}
      aria-label={
        preview
          ? "Live case file preview"
          : "Generated cofounder incident report"
      }
    >
      <div className="case-file__topline">
        <span>F/MC INCIDENT REPORT</span>
        <span data-report-id>CASE #000000</span>
      </div>
      <div className="case-file__meta">
        <div className="case-file__stamp" data-report-severity>
          SEVERITY: SERIES B
        </div>
        <figure className="case-file__subject" data-report-subject hidden>
          {/* Blob URLs stay local and cannot use Next image optimization. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-report-avatar alt="" />
          <figcaption>SUBJECT</figcaption>
        </figure>
      </div>
      <dl>
        <div>
          <dt>CHARGE</dt>
          <dd data-report-charge />
        </div>
        <div>
          <dt>STATEMENT</dt>
          <dd data-report-incident />
        </div>
        <div>
          <dt>THEIR DEFENSE</dt>
          <dd data-report-quote />
        </div>
        <div>
          <dt>ADULT TRANSLATION</dt>
          <dd data-report-translation />
        </div>
      </dl>
      <footer>
        <span>BOARD DISPOSITION</span>
        <strong data-report-disposition />
        <small>fuckmycofounder.com · satire, obviously</small>
      </footer>
    </article>
  );
}
