import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import Layout from "../components/Layout";

export default function Home() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const formData = new FormData(e.target);

      const response = await fetch("/api/images", {
        method: "POST",
        body: JSON.stringify({
          url: formData.get("url"),
          fullPage: formData.get("fullPage") === "on",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      router.push("/screenshots");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="wrapper">
        <h1>Submit a URL to take a screenshot of a website/page</h1>
        <p>URLs that do not require authentication work best</p>
        <form onSubmit={handleFormSubmit}>
          <h2>Submit a URL</h2>
          <div className="input-group">
            <label htmlFor="url">URL</label>
            <input
              type="url"
              name="url"
              id="url"
              placeholder="Enter URL here"
              required
              autoComplete="url"
              disabled={isLoading}
            />
          </div>
          <div className="input-group">
            <label htmlFor="url">Scrolling screenshot</label>

            <span>
              <input
                type="checkbox"
                name="fullPage"
                id="fullPage"
                disabled={isLoading}
              />{" "}
              Scroll page
              <p>
                <small>
                  Whether to take a screenshot of the full page or just the
                  viewport
                </small>
              </p>
            </span>
          </div>

          <button type="submit" disabled={isLoading}>
            SUBMIT
          </button>
        </form>
      </div>
      <style jsx>{`
        div.wrapper {
          display: flex;
          flex-flow: column;
          align-items: center;
        }

        div.wrapper > form {
          width: 50%;
          margin: 0 auto;
          background-color: #e7e6fd;
          padding: 32px 16px;
          display: flex;
          flex-flow: column;
          gap: 8px;
          border-radius: 5px;
        }

        div.wrapper > form > div.input-group {
          display: flex;
          flex-flow: column;
          gap: 8px;
        }

        div.wrapper > form > div.input-group > label {
          font-weight: bold;
        }

        div.wrapper > form > div.input-group > input {
          height: 50px;
          border: none;
          padding: 0 8px;
          border-radius: 5px;
        }

        div.wrapper > form > button {
          height: 50px;
          width: 100%;
          border-radius: 5px;
          color: #ffffff;
        }
      `}</style>
    </Layout>
  );
}
