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
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Hub } from "aws-amplify/utils";
import {
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";

// Configure Amplify (Gen1) with generated Cognito settings
Amplify.configure(awsExports);

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
    console.log("Signed in as:", user?.username || user?.userId);
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

  if (authStatus === "authenticated") {
    return <App />;
  }
  // Centered login / create account page
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Authenticator
          loginMechanisms={["email"]}
          signUpAttributes={["email"]}
        />
      </div>
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
