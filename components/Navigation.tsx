"use client";
import Image from 'next/image';
import React, { useState, useEffect } from "react";

import styles from '../app/scss/Navigation.module.scss';

function handleNavigation(e: Event) {
  const target = e.target as HTMLElement;
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    const href = target.getAttribute('href')!;
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

export default function Navigation() {
  useEffect(() => {
    document.addEventListener('click', handleNavigation);
    return () => document.removeEventListener('click', handleNavigation);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className={styles.bar}>
      <div className={styles.container}>
        <a href="" className={styles.home}>
          <Image
            src="/icons/home.png"
            alt="Home icon"
            width={48}
            height={48}

            className={styles.homeIcon}
            priority
          />
        </a>
        {/* Desktop Navigation */}
        <ul className={styles.navigations}>
          <li className={styles.navItem}><a href="#projects" className={styles.navLink}>Work</a></li>
          <li className={styles.navItem}><a href="#about" className={styles.navLink}>Info</a></li>
          <li className={styles.navItem}><a href="#contact" className={styles.navLink}>Connect</a></li>
        </ul>
        {/* Hamburger Icon */}
            <button
              className={menuOpen ? `${styles.hamburger} ${styles.hamburgerOpen}` : styles.hamburger}
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={`${styles.hamburgerBar} bar1`}></span>
              <span className={`${styles.hamburgerBar} bar2`}></span>
              <span className={`${styles.hamburgerBar} bar3`}></span>
            </button>
      </div>
      {/* Mobile Menu */}
      <div className={`${styles.menu}${menuOpen ? ` ${styles.menuOpen}` : ''}`}>
        <ul className={styles.menuList}>
          <a
            href="#projects"
            className={styles.menuLink}
            tabIndex={menuOpen ? 0 : -1}
            aria-hidden={!menuOpen}
            onClick={() => setMenuOpen(false)}
          >
            Work
          </a>
          <a
            href="#about"
            className={styles.menuLink}
            tabIndex={menuOpen ? 0 : -1}
            aria-hidden={!menuOpen}
            onClick={() => setMenuOpen(false)}
          >
            Info
          </a>
          <a
            href="#contact"
            className={styles.menuLink}
            tabIndex={menuOpen ? 0 : -1}
            aria-hidden={!menuOpen}
            onClick={() => setMenuOpen(false)}
          >
            Connect
          </a>
        </ul>
      </div>
    </nav>
  );
}