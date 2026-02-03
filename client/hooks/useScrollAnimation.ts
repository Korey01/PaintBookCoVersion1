import { useEffect, useRef } from 'react';

export function useScrollAnimation(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -100px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options?.threshold, options?.rootMargin]);

  return ref;
}

export function useScrollAnimationList(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll('.scroll-animate');
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('in-view');
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -100px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options?.threshold, options?.rootMargin]);

  return ref;
}
