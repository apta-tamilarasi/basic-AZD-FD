import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";


console.log("app started");

const script = document.createElement("script");
script.src = "https://cdn.freshdev.io/assets/app-client@2.js";
async function init() {
  let client = await app.initialized();
  window.client = client;
  renderApp()
  client.events.on("app.activated", renderApp);
}
async function renderApp() {
  console.log("***renderApp***");
 
  client.instance.resize({ height: "700px" });
  try {
    const context = await client.instance.context();

    // Check if the app is running in the ticket_sidebar location
    if (context.location === "ticket_sidebar") {
      const data = await client.data.get("ticket");
      console.log("Ticket ID:", data.ticket.id);
      ReactDOM.render(
        <React.StrictMode>
          <App props={client} ticket_id={data.ticket.id} />
        </React.StrictMode>,
        document.getElementById("root")
      );
    } else {
      // Render App without ticket data if not in ticket_sidebar
      ReactDOM.render(
        <React.StrictMode>
          <App props={client} />
        </React.StrictMode>,
        document.getElementById("root")
      );
    }
  } catch (err) {
    console.error("Error fetching ticket data:", err);
  }
}

script.addEventListener("load", init);
script.async = true;
document.head.appendChild(script);