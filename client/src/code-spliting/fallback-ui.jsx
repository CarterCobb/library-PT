import React from "react";

const styles = {
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
  },
};

/**
 * React Suspense fallback UI
 */
export const fallback = (
  <div style={styles.center}>
    <h1>Loading your experiance....</h1>
  </div>
);
