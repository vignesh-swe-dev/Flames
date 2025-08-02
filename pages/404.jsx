import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="main-container">
      <Head>
        <title>404 — Page Not Found | FLAMES</title>
        <meta name="description" content="This page could not be found." />
      </Head>

      <main className="love-letter-card">
        <h1 className="title heartbeat handwriting" style={{ fontSize: '3rem' }}>
          404
        </h1>
        <p className="subtitle handwriting" style={{ marginBottom: '20px' }}>
          Lost in the Flames of Love
        </p>

        <div style={{ fontSize: '3.5rem', marginBottom: '15px' }} aria-hidden="true">
          💔
        </div>

        <p className="result-desc handwriting" style={{ marginBottom: '25px', fontSize: '1.15rem' }}>
          Oops! The page or secret love note you were looking for seems to have vanished into thin air.
        </p>

        <Link
          href="/"
          className="calc-button handwriting"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            textAlign: 'center',
            padding: '12px 24px'
          }}
        >
          💌 Return to Calculator
        </Link>
      </main>
    </div>
  );
}
