import Head from "next/head";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Take website screenshots using puppeteer</title>
        <meta
          name="description"
          content="Take website screenshots using puppeteer"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav>
        <ul>
          <li>
            <Link href="/">
              <a>Home</a>
            </Link>
          </li>
          <li>
            <Link href="/screenshots">
              <a>Screenshots</a>
            </Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
      <style jsx>{`
        nav {
          min-height: 100px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          background: #fafafa;
        }

        nav ul {
          list-style: none;
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          margin: 0 16px;
          color: #ffffff;
        }

        main {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
