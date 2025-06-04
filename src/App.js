import React, { useState, useEffect } from 'react';
import './App.css';

import WorkItemModal from './components/CreateWorkItem';
import HelloUser from './components/SideApp';
import ConnectedWorkItemModal from './components/ConnectedWorkItemModal';
import { CommentsForAll } from './components/BulkCommentPage';
import AzureWorkItemComments from './components/WorkItemDetailsPage';
import TreeSample from './components/TreeOptionModal';

const App = ({props,ticket_id}) => {
  const [child, setChild] = useState(<h3>App is loading</h3>);
  const [loaded, setLoaded] = useState(false);

  console.log("app.js props: ", props);
  console.log("ticket_id", ticket_id);

  useEffect(() => {
    console.log("useEffect for loading components", loaded);
  
    if (!loaded) {
      // Initialize the app
      app.initialized().then((client) => {
        client.instance.context().then((data) => {
          console.log("App initialized, context data:", data);
  
          // Resize instance if required
          client.instance.resize({ height: "700px" });
  
          const location = data.location;
          console.log("Location:", location);
  
          const InstanceData = data.data;
          let ModalID = '';
  
          // Handle location-specific logic
          if (location === "ticket_sidebar") {
            client.data
              .get("ticket")
              .then((ticketData) => {
                console.log("Ticket Data:", ticketData);
  
                const currentTicketDetails = ticketData.ticket;
  
                setChild(<HelloUser ticketDetails={currentTicketDetails} />);
              })
              .catch((err) => {
                console.log("Error fetching ticket data:", err);
              });
          }
  
          if (InstanceData && InstanceData.hasOwnProperty('modalID')) {
            ModalID = InstanceData.modalID;
          }
  
          // Handle modals based on ModalID
          if (location === "modal" && ModalID === 'ModalOne') {
            console.log("Inside WorkItem Modal");
            setChild(<WorkItemModal client={client} />);
          }
          if (location === "modal" && ModalID === 'ModalTwo') {
            setChild(<CommentsForAll props={data.data.bulkdata} />);
          }
          if (location === "modal" && ModalID === 'ModalThree') {
            setChild(<AzureWorkItemComments props={data.data.modalData} />);
          }
          if (location === "modal" && ModalID === 'TreeModal') {
            setChild(<TreeSample />);
          }
          if (location === "modal" && ModalID === "Modelfour") {
            setChild(
              <ConnectedWorkItemModal
                modalData={data.data.modalData}
                client={client}
              />
            );
          }
        });
      });
    }
  }, [ticket_id]);
  

  return (
    <div>
      {child}
    </div>
  );
}
export default App;
