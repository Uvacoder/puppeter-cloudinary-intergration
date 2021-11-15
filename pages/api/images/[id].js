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
