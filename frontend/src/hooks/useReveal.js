import { useEffect, useRef } from 'react';

export default function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    // Observe all .reveal* children
    el.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur').forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, []);
  return ref;
}
