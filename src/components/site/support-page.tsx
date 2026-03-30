import Link from "next/link";

import styles from "./support-page.module.css";

type SupportSection = {
  title: string;
  body: string;
};

type SupportAction = {
  label: string;
  href: string;
};

type SupportPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: SupportSection[];
  actions?: SupportAction[];
};

export function SupportPage({ eyebrow, title, description, sections, actions = [] }: SupportPageProps) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {actions.length > 0 && (
            <div className={styles.actions}>
              {actions.map((action) => (
                <Link key={action.label} href={action.href}>
                  {action.label}
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className={styles.sections}>
          {sections.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
