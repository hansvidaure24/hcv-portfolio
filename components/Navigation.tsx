
"use client";
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import styles from '../app/scss/Navigation.module.scss';


function handleAnchorClick(e: Event) {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    const href = target.getAttribute('href')!;
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY;
      const startY = window.scrollY;
      const duration = 100; // ms (very fast)
      let start: number | null = null;
      function step(ts: number) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        window.scrollTo(0, startY + (y - startY) * progress);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }
}

export default function Navigation() {
  useEffect(() => {
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className={styles.navBar}>
      <div className={styles.navContainer}>
        <a href="" className={styles.homeLink}>
          <Image
            src="/icons/home.png"
            alt="Home icon"
            width={48}
            height={48}
            className={styles .homeIcon}
            priority
          />
        </a>
        {/* Desktop Nav */}
        <ul className={styles.navList}>
          <li className={styles.navItem}><a href="#projects" className={styles.navLink}>Projects</a></li>
          <li className={styles.navItem}><a href="#about" className={styles.navLink}>Bio</a></li>
          <li className={styles.navItem}><a href="#contact" className={styles.navLink}>Contact</a></li>
        </ul>
        {/* Hamburger Icon */}
        <button
          className={styles.hamburger + (menuOpen ? ' ' + styles.hamburgerOpen : '')}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.hamburgerBar + ' bar1'}></span>
          <span className={styles.hamburgerBar + ' bar2'}></span>
          <span className={styles.hamburgerBar + ' bar3'}></span>
        </button>
      </div>
      {/* Mobile Menu */}
      <div className={styles.mobileMenu + (menuOpen ? ' ' + styles.mobileMenuOpen : '')}>
        <ul className={styles.mobileNavList}>
          <li><a href="#projects" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Projects</a></li>
          <li><a href="#about" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Bio</a></li>
          <li><a href="#contact" className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>Contact</a></li>
        </ul>
      </div>
    </nav>
  );
}