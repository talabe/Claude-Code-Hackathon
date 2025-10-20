/**
 * main.jsx - Application Entry Point
 *
 * This is the entry point for the SlideRx React application.
 * It mounts the App component to the DOM and imports global styles.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import {
  Authenticator,
  useAuthenticator,
  ThemeProvider,
  View,
  Image,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./authenticator-custom.css";
import { Hub } from "aws-amplify/utils";
import logoDark from "./logo-light.png";
import {
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";

// Configure Amplify (Gen1) with generated Cognito settings
Amplify.configure(awsExports);

// Custom theme for Authenticator to match SlideRx brand
const authTheme = {
  name: "SlideRx Theme",
  tokens: {
    colors: {
      background: {
        primary: "#000000", // Black background
        secondary: "#1a1a1a", // Slightly lighter black for hover
      },
      font: {
        primary: "#ffffff", // White text
        secondary: "#ceced0", // Light gray for secondary text
        interactive: "#c7e565", // Lime green for links
      },
      brand: {
        primary: {
          10: "#c7e565", // Lime green
          80: "#c7e565",
          90: "#c7e565",
          100: "#90BC00", // Dark green for hover
        },
      },
      border: {
        primary: "#333333", // Dark border
        secondary: "#444444",
      },
    },
    components: {
      authenticator: {
        router: {
          backgroundColor: "#000000",
          borderColor: "#333333",
          boxShadow: "0 10px 30px rgba(199, 229, 101, 0.1)",
        },
      },
      button: {
        primary: {
          backgroundColor: "#c7e565",
          color: "#000000",
          _hover: {
            backgroundColor: "#90BC00",
          },
          _focus: {
            backgroundColor: "#90BC00",
            borderColor: "#c7e565",
          },
        },
      },
      fieldcontrol: {
        backgroundColor: "#ffffff",
        borderColor: "#333333",
        color: "#222222",
        _focus: {
          borderColor: "#c7e565",
          backgroundColor: "#ffffff",
        },
      },
      tabs: {
        item: {
          color: "#ceced0",
          _active: {
            borderColor: "#c7e565",
            color: "#c7e565",
          },
          _hover: {
            color: "#c7e565",
          },
        },
      },
    },
    fonts: {
      default: {
        variable: { value: "Montserrat, sans-serif" },
        static: { value: "Montserrat, sans-serif" },
      },
    },
  },
};

// --- Auth hardening for revoked/stale tokens ---
// Helper: remove stale Cognito tokens from localStorage
function clearCognitoLocalStorage() {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(window.localStorage);
    keys.forEach((k) => {
      if (
        k.includes("CognitoIdentityServiceProvider") ||
        k.startsWith("amplify-") ||
        k.includes("aws.cognito.identity")
      ) {
        window.localStorage.removeItem(k);
      }
    });
  } catch (e) {
    // Non-fatal cleanup failure
    console.warn("Could not clear Cognito localStorage keys", e);
  }
}

async function warmSessionAfterSignIn() {
  try {
    // Ensure fresh tokens immediately after sign-in
    await fetchAuthSession({ forceRefresh: true });
    // Touch attributes early to surface issues while still in Authenticator
    await fetchUserAttributes();
    const user = await getCurrentUser();
    // console.log("Signed in as:", user?.username || user?.userId);
  } catch (e) {
    const msg = e?.message || e?.toString?.() || "";
    const isRevoked =
      msg.includes("Access Token has been revoked") ||
      e?.name === "NotAuthorizedException";
    if (isRevoked) {
      console.warn(
        "Access token revoked right after sign-in. Cleaning up and signing out."
      );
      clearCognitoLocalStorage();
      try {
        await signOut({ global: true });
      } catch {}
    } else {
      console.warn("Post sign-in warm-up failed:", e);
    }
  }
}

// Register Hub listener once (avoid duplicate in React.StrictMode dev)
if (typeof window !== "undefined" && !window.__authHubListenerAdded) {
  window.__authHubListenerAdded = true;
  Hub.listen("auth", ({ payload }) => {
    const { event } = payload || {};
    if (event === "signedIn") {
      warmSessionAfterSignIn();
    } else if (event === "tokenRefresh_failure") {
      console.warn("Token refresh failed; clearing session and signing out.");
      clearCognitoLocalStorage();
      signOut({ global: true }).catch(() => {});
    }
  });
}

// Boot-time sanity check: if session is invalid/revoked, clean and sign out
(async () => {
  try {
    await fetchAuthSession();
  } catch (e) {
    const msg = e?.message || "";
    if (
      msg.includes("Access Token has been revoked") ||
      e?.name === "NotAuthorizedException"
    ) {
      console.warn(
        "Detected revoked/invalid session on boot. Clearing local storage and signing out."
      );
      clearCognitoLocalStorage();
      try {
        await signOut({ global: true });
      } catch {}
    }
  }
})();

// Gate the app: show centered Authenticator when unauthenticated
function Root() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);

  // When user logs out, reset the URL to home to avoid re-triggering logout on sign-in
  React.useEffect(() => {
    if (authStatus !== "authenticated" && window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, [authStatus]);

  // Custom components for the Authenticator
  const components = {
    SignIn: {
      Header() {
        return (
          <View textAlign="center" padding="medium">
            <a
              href="https://master.d2o9vrrs9fbgj.amplifyapp.com"
              style={{ cursor: "pointer", display: "inline-block" }}
            >
              <Image
                alt="SlideRx Logo"
                src={logoDark}
                maxWidth="200px"
                margin="0 auto"
                style={{ transition: "opacity 0.3s ease" }}
              />
            </a>
          </View>
        );
      },
    },
    SignUp: {
      Header() {
        return (
          <View textAlign="center" padding="medium">
            <a
              href="https://master.d2o9vrrs9fbgj.amplifyapp.com"
              style={{ cursor: "pointer", display: "inline-block" }}
            >
              <Image
                alt="SlideRx Logo"
                src={logoDark}
                maxWidth="200px"
                margin="0 auto"
                style={{ transition: "opacity 0.3s ease" }}
              />
            </a>
          </View>
        );
      },
    },
  };

  if (authStatus === "authenticated") {
    return <App />;
  }
  // Centered login / create account page
  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex-1 flex items-center justify-center">
        <ThemeProvider theme={authTheme}>
          <Authenticator
            loginMechanisms={["email"]}
            signUpAttributes={["email"]}
            components={components}
          />
        </ThemeProvider>
      </div>
      {/* Copyright Footer */}
      <footer className="w-full text-center py-6 text-sm text-gray-500">
        <p>
          2025@ Copyright{" "}
          <a
            href="https://master.d2o9vrrs9fbgj.amplifyapp.com"
            className="text-lime-400 hover:text-lime-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            SlideRX
          </a>
        </p>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <Root />
    </Authenticator.Provider>
  </React.StrictMode>
);
