
"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import Image from "next/image";
import styles from "../app/scss/Contact.module.scss";

export const Socials = {
  links: [
    {
      name: 'GitHub',
      url: 'https://github.com/hansvidaure24',
      icon: '/icons/icon-github.png',
      description: 'GitHub: View my GitHub profile and projects',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hans-chandler-vidaure-0a1797190',
      icon: '/icons/icon-linkedin.png',
      description: 'LinkedIn: Connect with me professionally',
    },
  ],
}

export default function Contact() {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null)
  const [isNarrow, setIsNarrow] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const messageBarRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const handleResize = () => {
      if (!messageBarRef.current) return;
      setIsNarrow(messageBarRef.current.offsetWidth <= 635);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  function getIconSrc(icon: string, isHovered: boolean, isNarrow: boolean) {
    if (!icon.endsWith('.png')) return icon;
    const baseName = icon.replace('.png', '');
    if (isNarrow) return `${baseName}-hover.png`;
    if (!isHovered) return icon;
    return `${baseName}-hover.png`;
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        className={styles.contactSection}
      >
        <h1 className={styles.contactTitle}>
          Want to add me on your Pokémon team deck?
        </h1>
        <span className={styles.bounceIcon}>🔻</span>
        <div className={`${styles.contactdiv}`}>
          <div className={styles.card}>
            <Image
              src="/graphics/hans.png"
              alt="Hans Chandler Vidaure"
              width={600}
              height={800}
              className={styles.contactImage}
              priority
            />
          </div>
        </div>
        <div className="max-w-6xl w-full m-2 px-4 sm:px-6 lg:px-8">
          <div ref={messageBarRef} className={styles.messageBar}>
            <div className={`flex items-center gap-6 ${isNarrow ? 'justify-center' : 'justify-between'}`}>
              {!isNarrow ? (
                <a
                  href="mailto:hansvidaure24@gmail.com"
                  className={styles.messageLink}
                  aria-label="Email Hans"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Image
                    src={'/icons/message.png'}
                    alt="message icon"
                    width={48}
                    height={48}
                    className="rounded- bg-transparent border-none"
                    style={{height: 'auto', width: 'auto'}}
                  />
                  <span style={{ marginLeft: 4, position: 'relative', whiteSpace: 'nowrap' }}>
                    Send me a message
                    {isHovered && (
                      <span className={styles.animatedEllipsis} aria-hidden="true">
                        <span className={styles.dot + ' ' + styles.dot1}>.</span>
                        <span className={styles.dot + ' ' + styles.dot2}>.</span>
                        <span className={styles.dot + ' ' + styles.dot3}>.</span>
                      </span>
                    )}
                  </span>
                </a>
              ) : (null)}
              <div className={styles.socialIcons}>
                {isNarrow ? (
                <a
                  href="mailto:hansvidaure24@gmail.com"
                  className={styles.socialIconBtn}
                  aria-label="Email Hans"
                  title="Email: hansvidaure24@gmail.com"
                >
                  <Image
                    src={'/icons/message.png'}
                    alt="message icon"
                    width={32}
                    height={32}
                  />
                </a>
              ): (null)}
                {Socials.links.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.description}
                    className={styles.socialIconBtn}
                    onMouseEnter={() => setHoveredSocial(link.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                  >
                    {link.icon && (
                      <>
                        {link.icon.endsWith('.png') ? (
                          <Image
                            src={getIconSrc(link.icon, hoveredSocial === link.name, isNarrow)}
                            alt={`${link.name} icon`}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span className="text-lg">{link.icon}</span>
                        )}
                      </>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}