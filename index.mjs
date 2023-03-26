import { PlexOauth } from "plex-oauth";
import axios from "axios";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import xml2js from "xml2js";

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

let clientInformation = {
  clientIdentifier: "PlexOpener.1.0",
  product: "PlexOpener",
  device: "PlexOpener.1.0",
  version: "1",
  forwardUrl: process.env.FORWARD_URL,
  platform: "Web",
  urlencode: true,
};


let plexOauth = new PlexOauth(clientInformation);

app.use(cookieParser());
app.use("/public-ip.js", express.static(path.join(process.cwd(), "public-ip.js")));


app.get("/", async (req, res) => {
  try {
    const [hostedUILink, pinId] = await plexOauth.requestHostedLoginURL();
    res.cookie("pinId", pinId);
    res.redirect(hostedUILink);
  } catch (err) {
    res.status(500).send("Error occurred while generating login URL.");
  }
});

app.get("/loggedin", async (req, res) => {
  const pinId = req.cookies.pinId;
  try {
    const authToken = await plexOauth.checkForAuthToken(pinId);
    if (authToken) {
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const { username, avatarUrl } = await getUserDetails(authToken);
      if (ipAddress && username) {
        await triggerWebhook(username, ipAddress);
      } else {
        console.error("Failed to get IP address or username");
      }
      res.render("loggedin", {
        username: username,
        avatarUrl: avatarUrl,
      });
    } else {
      res.status(401).send("Authentication failed.");
    }
  } catch (err) {
    console.error(err);
        console.error("Error occurred while checking for auth token:", err);
    res.status(500).send("Wabeliwubeli");
    // res.status(500).send("Error occurred while checking for auth token. Blup");
  }
});


async function getUserDetails(authToken) {
  try {
    const response = await axios.get("https://plex.tv/users/account", {
      headers: {
        "X-Plex-Token": authToken,
      },
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    console.log("Result JSON:", JSON.stringify(result, null, 2));

    if (result && result.user) {
      return {
        username: result.user.username || null,
        avatarUrl: result.user.$ && result.user.$.thumb ? result.user.$.thumb : null,
      };
    } else {
      console.log("User details not found in result JSON");
      return { username: null, avatarUrl: null };
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    return { username: null, avatarUrl: null };
  }
}

async function getPublicIPAddress() {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    return response.data.ip;
  } catch (error) {
    console.error("Error fetching public IP:", error);
    return null;
  }
}


async function getUsername(authToken) {
  try {
    const response = await axios.get("https://plex.tv/users/account", {
      headers: {
        "X-Plex-Token": authToken,
      },
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    console.log("Result JSON:", JSON.stringify(result, null, 2));

    if (result && result.user && result.user.username) {
      return result.user.username;
    } else {
      console.log("Username not found in result JSON");
      return null;
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
}


async function triggerWebhook(username, ipAddress) {
  const webhookUrl = process.env.WEBHOOK_URL;
  const payload = {
    username,
    ipAddress,
  };

  try {
    await axios.post(webhookUrl, payload);
  } catch (error) {
    console.error("Error triggering webhook:", error);
  }
}



app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
