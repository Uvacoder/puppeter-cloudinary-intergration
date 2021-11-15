# Take screenshots of websites using puppeteer, next.js and cloudinary

## Introduction

When testing webpages, you may need to take a screenshot of that particular site programmaticaly. You can then use these screenshots to detect layout shifts, test different viewports and more. In this brief tutorial, let's take a look at how we can achieve this using [Puppeteer](https://pptr.dev/), [Cloudinary](https://cloudinary.com/?ap=em) and [Next.js](https://nextjs.org/).

[Puppeteer](https://pptr.dev/) is a Node library that runs a [headless](https://developers.google.com/web/updates/2017/04/headless-chrome) browser and allows you to control the headless browser via an API. In special circumstances, it can be configured to run a full browser.

[Cloudinary](https://cloudinary.com/?ap=em) is a service that provides developers with a number of APIs that allow for storage of media, optimization, transformations, delivery among others. It's easy to use and you can get started with a free developer account immediately.

[Next.js](https://nextjs.org/) is a react framework that offers feautures such as hybrid static and server rendering and more.

## Setup

It's important to note that working knowledge of Javascript is required for this tutorial. Familiarity with React.js and Next.js is also encouraged. If you haven't used Next.js before, don't panic. It's basically just React with a few built in features that are easy to pick up and grasp.

Let's first create a [Next.js](https://nextjs.org/) project. Run the following command in your terminal/CMD in your desired folder.

```bash
npx create-next-app website-screenshots-using-puppeteer
```

The `create-next-app` CLI scaffolds a new project called `website-screenshots-using-puppeteer`. You can use any appropriate name for this. We now have a project with a minimal configuration.

Next, we need to install the dependencies that we need. In our case we need [puppeteer](http://npmjs.com/package/puppeteer) and [cloudinary](https://www.npmjs.com/package/cloudinary). Run the following command.

```bash
npm install puppeteer cloudinary
```

Once you have all that done, open up your project in your favorite code editor and create a file called `.env.local` at the root of your project. We'll be using environment variables to store sensitive API keys. Next.js has built in support for environment variables. Read about those from the [documentation](https://nextjs.org/docs/basic-features/environment-variables).

> Do not check `.env.local` into source control

Paste the following code inside `.env.local`

```env
CLOUD_NAME=YOUR_CLOUD_NAME
API_KEY=YOUR_API_KEY
API_SECRET=YOUR_API_SECRET
```

Now all we need is the **cloud name**, **api key** and **api secret** from cloudinary. Head over to [cloudinary](https://cloudinary.com/?ap=em) and create an account if you do not already have one. Log into your account and navigate to the [console page](https://cloudinary.com/console?ap=em). On this page you'll find the **cloud name**, **api key** and **api secret**. Replace `YOUR_CLOUD_NAME` `YOUR_API_KEY` and `YOUR_API_SECRET` in the `.env.local` file with the appropriate values from the [console page](https://cloudinary.com/console?ap=em).

![Cloudinary Dashboard](https://github.com/newtonmunene99/website-screenshots-using-puppeteer/blob/master/public/images/cloudinary-dashboard.png "Cloudinary Dashboard")


That's it for the setup.

## Getting started

Create a new folder at the root of your project and call it `lib`. This folder will hold all of our shared code. Inside this folder create a new file called `cloudinary.js`. This file will hold all the functions we need to communicate with cloudinary(upload,get uploads, delete uploads e.t.c).

Paste the following inside `lib/cloudinary.js`

```js
// lib/cloudinary.js

// Import the v2 api and rename it to cloudinary
import { v2 as cloudinary, TransformationOptions } from "cloudinary";

// Initialize the sdk with cloud_name, api_key and api_secret
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const CLOUDINARY_FOLDER_NAME = "website-screenshots/";

/**
 * Gets a resource from cloudinary using it's public id
 *
 * @param {string} publicId The public id of the image
 */
export const handleGetCloudinaryResource = (publicId) => {
  return cloudinary.api.resource(publicId, {
    resource_type: "image",
    type: "upload",
  });
};

/**
 * Get cloudinary uploads
 * @returns {Promise}
 */
export const handleGetCloudinaryUploads = () => {
  return cloudinary.api.resources({
    type: "upload",
    prefix: CLOUDINARY_FOLDER_NAME,
    resource_type: "image",
  });
};

/**
 * Uploads an image to cloudinary and returns the upload result
 *
 * @param {{path: string; transformation?:TransformationOptions;publicId?: string; folder?: boolean; }} resource
 */
export const handleCloudinaryUpload = (resource) => {
  return cloudinary.uploader.upload(resource.path, {
    // Folder to store image in
    folder: resource.folder ? CLOUDINARY_FOLDER_NAME : null,
    // Public id of image.
    public_id: resource.publicId,
    // Type of resource
    resource_type: "auto",
    // Transformation to apply to the video
    transformation: resource.transformation,
  });
};

/**
 * Deletes resources from cloudinary. Takes in an array of public ids
 * @param {string[]} ids
 */
export const handleCloudinaryDelete = (ids) => {
  return cloudinary.api.delete_resources(ids, {
    resource_type: "image",
  });
};
```

At the top we import the v2 API and initialize it by calling the `.config` method and passing the cloud name, api key and api secret. We use the environment variables that we defined earlier inside `.env.local`. `CLOUDINARY_FOLDER_NAME` is the name of the folder where we want to store our images. `handleGetCloudinaryUploads` calls the `api.resources` method on the cloudinary SDK. This function gets all the images that we have uploaded to a specific folder. In our case, this is the folder that we have defined under the `CLOUDINARY_FOLDER_NAME` variable. Read more about this [here](https://cloudinary.com/documentation/admin_api#get_resources). `handleCloudinaryUpload` calls the `uploader.upload` method on the SDK. This function takes in an object which contains the path to the file we want to upload and any transformations that should be carried out on the image. Read about the upload method in the [upload documentation](https://cloudinary.com/documentation/image_upload_api_reference#upload_method). `handleCloudinaryDelete` passes an array of public IDs to the `api.delete_resources` method which deletes the resources with the given IDs from cloudinary. Read more about this [here](https://cloudinary.com/documentation/admin_api#delete_resources).

That's it for the cloudinary bit.

Next step is to create an API route to handle all the puppeteer and upload operations.

> Puppeteer is quite large since it downloads a full headless browser, you don't want to import it anywhere on the frontend.

If you're not familiar with API routes on Next.js, have a look at the [docs](https://nextjs.org/docs/api-routes/introduction).

Create a folder under `pages/api` and name it `images`. Inside `pages/api/images` go ahead and create two files, one named `index.js` and another called `[id].js`. The former will handle requests made to the `/api/images` endpoint and the latter will handle requests made to the `/api/images/:id` endpoint. This pattern is common to Next.js api routes, in case you're feeling a bit lost, see the [docs](https://nextjs.org/docs/api-routes/introduction).

Paste the following code inside of `pages/api/images/index.js`.

```js
// pages/api/images/index.js

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import puppeteer from "puppeteer";
import {
  handleCloudinaryUpload,
  handleGetCloudinaryUploads,
} from "../../../lib/cloudinary";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET": {
      try {
        const result = await handleGetRequest();

        return res.status(200).json({ message: "Success", result });
      } catch (error) {
        return res.status(400).json({ message: "Error", error });
      }
    }

    case "POST": {
      try {
        const result = await handlePostRequest(req.body);

        return res.status(201).json({ message: "Success", result });
      } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error", error });
      }
    }

    default: {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
}

const handleGetRequest = async () => {
  const uploads = await handleGetCloudinaryUploads();

  return uploads;
};

const handlePostRequest = async (options) => {
  // Get the url and fullPage from the options
  const { url, fullPage } = options;

  // Launch a new browser using puppeteer
  const browser = await puppeteer.launch();

  // Create a new page in the browser
  const page = await browser.newPage();

  const urlObject = new URL(url);

  // Define a path where the screenshot will be saved
  const path = `public/screenshots/${urlObject.hostname}.png`;

  // Navigate to the url
  await page.goto(url);

  // Take a screenshot of the page
  await page.screenshot({
    path,
    fullPage,
  });

  // Close the browser once done
  await browser.close();

  // Upload the screenshot to cloudinary
  const uploadResponse = await handleCloudinaryUpload({
    path,
    folder: true,
  });

  // Delete the screenshot from the server
  await fs.unlink(path);

  return uploadResponse;
};

```

At the top we import puppeteer, the cloudinary functions we defined earlier and the fs promisified module. We have a default export that is the function which will handle the incoming requests. We use a switch statement to only handle GET and POST requests.

`handleGetRequest` calls the `handleGetCloudinaryUploads` function that we created earlier to get all uploaded resources.

`handlePostRequest` takes in the request body which contains the url of the webpage that we want a screenshot of and a boolean named fullPage. We then launch a new browser using puppeteer, create a new page and navigate to the url. To take a screenshot, we pass in an optional options object with two fields, the first is a `path` where the screenshot will be saved. If you omit this, the screenshot is not saved to disk and you can use the resulting Buffer to create your own file. The second field is `fullPage`. This one determines whether to take a screenshot of the full page or just what is on the viewport. Once we're done, close the browser and upload the screenshot to cloudinary then delete the image that is saved to disk. You can read more about the options passed to puppeteer [here](https://pptr.dev/).

Paste the following code inside `pages/api/images/[id].js`

```js
// pages/api/images/[id].js

import { NextApiRequest, NextApiResponse } from "next";
import { handleCloudinaryDelete } from "../../../lib/cloudinary";

/**
 * The handler function for the API route. Takes in an incoming request and outgoing response.
 *
 * @param {NextApiRequest} req The incoming request object
 * @param {NextApiResponse} res The outgoing response object
 */
export default async function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case "DELETE": {
      try {
        if (!id) {
          throw new Error("No ID provided");
        }

        const result = await handleDeleteRequest(id);

        return res.status(200).json({ message: "Success", result });
      } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error", error });
      }
    }

    default: {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
}

/**
 * Handles the DELETE request to the API route.
 *
 * @param {string} id Public ID of the image to delete
 */
const handleDeleteRequest = (id) => {
  // Delete the uploaded image from Cloudinary
  return handleCloudinaryDelete([id.replace(":", "/")]);
};

```

This is very similar to the other file other than that we're only handling DELETE requests.  We call `handleCloudinaryDelete` function and pass it the image/resource id for deletion.

That's it for the backend. Let's move on to the frontend.

For the frontend, I won't get too much into everything since this tutorial assumes that you have basic knowledge of React. If you need some help with something you can check out the [React docs](https://reactjs.org/). You might also notice the use of some react hooks such as `useState`, `useEffect` and `useCallback`. You can read about these in the links; [useState](https://reactjs.org/docs/hooks-reference.html#usestate), [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect), and [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback).

Open `styles/globals.css` and add the following code inside.

```css
/* styles/global.css */

:root {
  --color-primary: #0070f3;
  --color-primary-light: #00b8ff;
}

a {
  color: inherit;
  text-decoration: none;
}

a,
button {
  background-color: var(--color-primary);
  padding: 20px 30px;
  font-weight: bold;
}

button {
  border: none;
}

button:disabled {
  background-color: #cfcfcf;
}

a:hover,
button:hover:not([disabled]) {
  background-color: var(--color-primary-light);
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}
```

These are just a few styles to help us with the UI. You might notice the use of CSS variables. I'll not go into that but you can find numerous resources online. 

Create a folder called `components` at the root of your project and inside it create a file called `Layout.js`. Paste the following code inside.

```jsx
// components/Layout.js

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

```

This is just a simple component to wrap our pages in. This way we minimize code duplication and also have a consistent layout.

Paste the following code inside `pages/index.js`. Please note that this is not the same as `pages/api/images/index.js`.

```jsx
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
```

On this page we just have a form with two inputs, one for the url and another for the fullPage option. Once the form is submitted, `handleFormSubmit` is triggered and then makes a POST request to `/api/images` with the url and fullPage as the body. Upon success we navigate to the `/screenshots` page that we'll be creating shortly. 

Create a new file under `pages` and call it `screenshots.js`. Paste the following code inside `pages/screenshots.js`

```jsx
// pages/screenshots.js

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

```

On this page, we call the `getScreenshots` function when the component is rendered. `getScreenshots` makes a GET request to the `/api/images` endpoint that we created earlier in the backend. This returns an array of all the resources uploaded. We then display each of these images on our page. Each image also has a delete button which when pressed triggers `handleDelete` and passes the images public id. `handleDelete` makes a DELETE request to the `/api/images/:id` endpoint that we created and deletes the image with the given ID. 

If you're wondering where we're getting the `public_id`,`secure_url` e.t.c., this is the response returned from the `handleGetCloudinaryUploads` function that we defined in the `cloudinary.js` file. You can view a sample response [here](https://cloudinary.com/documentation/admin_api#sample_response).

One more thing and we're ready to run our simple application. We need to configure the Image component from Next.js to be able to fetch and optimize images from cloudinary. To achieve this, add the following to `next.config.js`. It's at the root of your project. You can create it manually if it does not exist.

```js
module.exports = {
  // ... other options
  images: {
    domains: ["res.cloudinary.com"],
  },
};
```

For more detailed information about why we just did that, you can have a read [here](https://nextjs.org/docs/api-reference/next/image#configuration-options)

You can now run your app on development

```bash
npm run dev
```

And that's it for this tutorial. This is just a simple demonstration. You can find more complex use cases and implement those. 

You can find the full code on my [Github](https://github.com/newtonmunene99/website-screenshots-using-puppeteer)