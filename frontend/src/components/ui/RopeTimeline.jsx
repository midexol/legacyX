import React from 'react';
import styles from './RopeTimeline.module.css';

export default function RopeTimeline({ steps = [], currentStep = 0 }) {
  return (
    <div className={styles.timeline}>
      {steps.map((step, i) => {
        const done    = i < currentStep;
        const active  = i === currentStep;
        const future  = i > currentStep;
        return (
          <div key={i} className={styles.item}>
            {/* Rope line above (not for first) */}
            {i > 0 && (
              <div className={`${styles.rope} ${done ? styles.ropeDone : styles.ropeEmpty}`} />
            )}

            {/* Knot */}
            <div className={`${styles.knot} ${done ? styles.knotDone : active ? styles.knotActive : styles.knotFuture}`}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <polyline
                    points="2,6 5,9 10,3"
                    fill="none"
                    stroke="#090909"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span className={styles.knotNum}>{i + 1}</span>
              )}
            </div>

            {/* Content */}
            <div className={`${styles.content} ${future ? styles.contentFuture : ''}`}>
              <div className={styles.stepLabel}>Step {String(i + 1).padStart(2, '0')}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              {step.desc && (
                <div className={styles.stepDesc}>{step.desc}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
