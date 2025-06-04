import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import reactLogo from "../assets/logo.svg";
import icon from "../assets/icon.svg";

import { ImHome3 } from "react-icons/im";
import { ImNewTab } from "react-icons/im";

import "../styles/sideapp.css";

import ConnectAzure from "./ConnectWorkItem";

import { Tabs, Tooltip } from "antd";

import ListConnectedWorkItem from "./ListConnectedWorkItem";

import Button from "monday-ui-react-core/dist/Button";
import { Add } from "monday-ui-react-core/icons";
import Loader from "monday-ui-react-core/dist/Loader";

import { FwButton, ToastController, FwToast, FwToastMessage } from "@freshworks/crayons/react";



const HelloUser = (props) => {
  console.log("sideapp.js props:", props);
// 
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); 
    const [AuthErrorMessage, setAuthErrorMessage] = useState('');
  const [hideNewWorkItemButton, setHideNewWorkItemButton] = useState(false); 
  const handleRateLimitError = () => {
    setErrorMessage("Rate limit exceeded. Please try again after 1 minute.");
    setHideNewWorkItemButton(true);
  };
  const handleAuthError = () => {
    setAuthErrorMessage("Authentication Error: API key has expired. Please update the API key to proceed.");
    setHideNewWorkItemButton(true);
  };
  client.instance.receive(function (event) {    
    if (event.type === "rateLimitError") {
      handleRateLimitError();
    }
  });
  
  // console.log("sideapp.js props:", props);
  let ticket_details = props.ticketDetails
  useEffect(() => {
    getProject();
  }, [ticket_details]);
  async function getProject() {
    setLoading(true); 
    try {
      //  let simulateError = true; 

      //       if (simulateError) {
      //         throw { status: 429, message: "Rate limit exceeded" };
      //       }
      let data = await client.request.invokeTemplate(
        "getAzureProjects",
        {}
      );
      console.log("getAzureProjects", JSON.parse(data.response));
    } catch (err) {
      console.log("Error in getAzureProjects",err);
      if (err?.response?.includes("Access Denied") || err.status === 401 || err.status === 403) {
        setErrorMessage("Access Denied: The Azure DevOps access token used has expired.");
        setHideNewWorkItemButton(true); 
      } else if (err?.status === 429) { 
        handleRateLimitError(); 
      }
    }
    setLoading(false); 
  }


  const openModal = () => {
    // console.log("open modal function starting");
  
    client.interface
      .trigger("showModal", {
        title: "New Work Item",
        template: "index.html",
        data: { modalID: 'ModalOne' },
      })
      .then(function (data) {
        console.log("Modal opened successfully", data);
      })
      .catch(function (error) {
        console.log("Error opening modal", error);
      });
  };
  client.instance.receive((event) => {
    // console.log("received data from createworkitem modal",event);
    
    if (event.data && event.data.message) {
        // console.log("Received message:", event.data.message);
        if (event.data.message.status === 'success') {
            client.interface.trigger('showNotify', {
                type: 'success',
                title: 'Success:',
                message: event.data.message.content,
            });
        } else if (event.data.message.status === 'error') {
            client.interface.trigger('showNotify', {
                type: 'danger',
                title: 'Error:',
                message: event.data.message.content,
            });
        } else if (event.data.message === "rateLimitError") {
          handleRateLimitError();
} 
        else {
            console.log("Received unexpected status:", event.data.status);
        }
    }
});

  const [showResults, setShowResults] = React.useState(false);
  const newTabFunc = () => setShowResults(true);


  const onChange = (key) => {
    console.log("key",key);
  };
  const items = [
    {
      key: "1",
      label: (
        <h3 className="home-icon">
                  <Tooltip placement="top"  title="Home">
          <ImHome3 size={22} />
          </Tooltip>

        </h3>

      ),
      children: (
        <div>
                      <span className="work-item-button-label">Add New Work Item</span>

          <div id="newWorkItemDiv">
            <Button
            className="work-item-button"
              onClick={openModal}
              leftIcon={Add}
              kind={Button.kinds.PRIMARY}
              size={Button.sizes.SMALL}
            >
              New Work Item
            </Button>
            
          </div>

          <div id="connectedWorkItemDiv">
            <div> 
            <ListConnectedWorkItem
                ticketDetails={props.ticketDetails}
                handleRateLimitError={handleRateLimitError}
                handleAuthError = {handleAuthError}/>
            </div>
        </div>
        </div>
      ),
 
    },
    {
      key: "2",
      label: (
        <h3 className="opentab-icon">
                  <Tooltip placement="top"  title="Connect Work Item">

          <ImNewTab size={22} />
          </Tooltip>

        </h3>
      ),
      children: (
        <div id="connectWorkItemDiv">
          <ConnectAzure ticketDetails={ticket_details} />
        </div>
      ),

    },
  ];
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: "50%", marginLeft: "50%" }}>
      <Loader color="var(--primary-color)" size={24} />
    </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ fontSize: '17px', marginTop: '50%', marginLeft: '10%', marginRight: '10%', textAlign: 'center' }}>
        {errorMessage}
      </div>
    );
  } if (AuthErrorMessage) {
    return (
      <div style={{ fontSize: '17px', marginTop: '50%', marginLeft: '10%', marginRight: '10%', textAlign: 'center'}}>
        {AuthErrorMessage}
      </div>
    );
  }
    return (
      <div className="navBar">
        {!hideNewWorkItemButton ? (
        <Tabs defaultActiveKey="1" centered items={items} onChange={onChange} />
      ) : null}
      </div>
    );
};

HelloUser.propTypes = {
  client: PropTypes.object,
};

export default HelloUser;
