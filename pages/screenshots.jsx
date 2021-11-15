import Layout from "../components/Layout";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function ScreenshotsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [screenshots, setScreenshots] = useState([]);

  const getScreenshots = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/images", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setScreenshots(data.result.resources);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getScreenshots();
  }, [getScreenshots]);

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);

      const normalizedId = id.replace(/\//g, ":");

      const response = await fetch(`/api/images/${normalizedId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      getScreenshots();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {screenshots.length > 0 ? (
        <div className="wrapper">
          <h1>{screenshots.length} Captured Screenshot(s)</h1>
          <div className="screenshots-wrapper">
            {screenshots.map((screenshot, index) => (
              <div className="screenshot-wrapper" key={`screenshot-${index}`}>
                <div className="screenshot">
                  <Image
                    src={screenshot.secure_url}
                    alt={screenshot.secure_url}
                    layout="responsive"
                    width={screenshot.width}
                    height={screenshot.height}
                  ></Image>
                </div>
                <div className="actions">
                  <a
                    href={screenshot.secure_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    OPEN IMAGE
                  </a>
                  <button
                    onClick={() => {
                      handleDelete(screenshot.public_id);
                    }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {isLoading ? (
        <div className="loading">
          <b>Loading...</b>
        </div>
      ) : null}
      {!isLoading && screenshots.length === 0 ? (
        <div className="no-images">
          <b>No Images Yet</b>
        </div>
      ) : null}
      <style jsx>{`
        div.wrapper {
          min-height: 100vh;
        }

        div.wrapper h1 {
          text-align: center;
        }

        div.wrapper div.screenshots-wrapper {
          display: flex;
          flex-flow: column;
          align-items: center;
          gap: 20px;
          background-color: #ffffff;
          padding: 20px 0;
        }

        div.wrapper div.screenshots-wrapper div.screenshot-wrapper {
          display: flex;
          width: 60%;
          flex-flow: column;
          background-color: #fafafa;
        }

        div.wrapper div.screenshots-wrapper div.screenshot-wrapper:hover {
          box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
            rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
        }

        div.wrapper
          div.screenshots-wrapper
          div.screenshot-wrapper
          div.screenshot {
          position: relative;
        }

        div.wrapper div.screenshots-wrapper div.screenshot-wrapper div.actions {
          padding: 20px;
          display: flex;
          flex-flow: column;
          gap: 8px;
          color: #ffffff;
        }

        div.wrapper
          div.screenshots-wrapper
          div.screenshot-wrapper
          div.actions
          a {
          color: #ffffff;
          width: fit-content;
        }

        div.wrapper
          div.screenshots-wrapper
          div.screenshot-wrapper
          div.actions
          button {
          color: #ffffff;
          width: fit-content;
        }

        div.loading,
        div.no-images {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </Layout>
  );
}
