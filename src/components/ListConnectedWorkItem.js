import React from "react";
import { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { Collapse, Modal, Tooltip } from "antd";
import Button from "monday-ui-react-core/dist/Button";
import Loader from "monday-ui-react-core/dist/Loader";
import Icon from "monday-ui-react-core/dist/Icon";
import { Forum } from "monday-ui-react-core/icons";
import { CloseOutlined } from "@ant-design/icons";
import "../styles/ListConnectedWorkItem.css";
import {Toast} from "monday-ui-react-core";
import { FwIcon, FwTooltip } from '@freshworks/crayons/react';
import { link_broken } from '@freshworks/crayons-icon';
const { Panel } = Collapse;
var db_config = {};
var isDarkMode;
var returnObj = {}

const eachIteration = (id,handleRateLimitError) => {
  console.log("inside of eachiteration function"); 
  let promises = [];
  let workItemIdArray = id[0]

  for (let j = 0; j < workItemIdArray.length; j++) {
   let promise =  new Promise(async(resolve, reject) => {
    
    try {
      
      let data = await client.request.invokeTemplate(
        "getAzureWorkItems",
        {
          context:{
            "cus_workItem_id": workItemIdArray[j]
          }
        }
      );

      returnObj= {
        "workItemId": workItemIdArray[j], 
        "status": data.status,
        "response": JSON.parse(data.response)
      }
      console.log("eachiteration response",returnObj);
      const selfLink = returnObj.response._links.self.href;
      // console.log("selflink",selfLink);
      const match = selfLink.match(/\/([^/]+)\/([^/]+)\/_apis/);
      const projectId = match ? match[2] : null; 
const bulkprojectdata = [{
  id: returnObj.response.id,
  projectId: projectId
}];

resolve(returnObj,bulkprojectdata)

    } catch (err) {
      if (err.status === 429) {
        handleRateLimitError(); 
        console.log("Rate limit exceeded in eachIteration.",err);
        reject({ workItemId: workItemIdArray[j], error: err });
      } else {
        console.log("Error in getAzureWorkitems in eachIteration function", err);
        console.log("Error in getAzureWorkitems in eachIteration function", err.response);
        reject({ workItemId: workItemIdArray[j], error: err });
      }
    }

  });


  promises.push(promise);
  }
  return promises;
// }); 
};

const FetchMondayConv = ({ displayID, handleRateLimitError, handleAuthError  }) => { 
  // console.log("displayID in fetchmondayconv",displayID);
  
  const [ArrList, setArrList] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [agentName, setagentName] = useState();
    const [agentEmail, setagentEmail] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    // const handle429Error = () => {
    //   console.log("429 error occurred, hiding New Work Item button");
    //   handleRateLimitError (true);
    // };
    
  let conv_id = [];

  let configData = client.services.EventAPI.context.settings;
  let azure_url = client.services.EventAPI.context.settings.azure_url;
  let FreshdeskURL = client.services.EventAPI.context.settings.domain;

    
    useEffect(() => {

    getNotes()

    async function getNotes() {
      let allConversations = []; 
      let page = 1;               
      let hasMorePages = true;    
      
      try {
        //  let simulateError = true; 
    
        //             if (simulateError) {
        //               throw { status: 401, message: "Rate limit exceeded" };
        //             }
        while (hasMorePages) {
          let data = await client.request.invokeTemplate("fetchConversation", {
            context: {
              "ticket_id": displayID,
              "page": page,  
            }
          });
      
          let projectsObj = JSON.parse(data.response);
          console.log("Fetched conversations (page " + page + "):", projectsObj);
      
          // Add the fetched conversations to the allConversations array
          allConversations = [...allConversations, ...projectsObj];
      
          hasMorePages = projectsObj.length === 30;
          page++; 
        }
        
        let conv_id_status_array = []; 
      
        for (let i = 0; i < allConversations.length; i++) {
          let b_text = allConversations[i].body_text;
          
          let myString = b_text;
      
          let n = myString.includes(azure_url);
          if (n === true) {
            let myWord = "#";
            let myPattern = new RegExp('(\\w*' + myWord + '\\w*)', 'gi');
      
            let matches = myString.match(myPattern);
      
            if (matches) {
              let str = matches[0].substring(1);
              if (str !== "undefined") {
                let status = null;
                if (myString.includes("connected")) {
                  status = "connected";
                }
                if (myString.includes("unlinked")) {
                  status = "unlinked";
                }
      
                conv_id_status_array.push({ id: str, status: status });
              }
            }
          }
        }
      
        console.log("conv_id_status_array:", conv_id_status_array);
      
        for (let i = 0; i < conv_id_status_array.length; i++) {
          let item = conv_id_status_array[i];
      
          if (item.status === "connected") {
            if (!conv_id.includes(item.id)) {
              conv_id.push(item.id);
              console.log("Workitem added. Current conv_id:", conv_id);
            }
          } else if (item.status === "unlinked") {
            conv_id = conv_id.filter(id => id !== item.id);
            console.log("Removed workitem ID. Current conv_id:", conv_id);
          }
        }
      
        setArrList([conv_id]);
      
      } catch (err) {
        console.log("getNotes error:", err);
        if (err.status === 429) {
          handleRateLimitError(); 
    }else if( err.status === 403 || err.status === 401){
      handleAuthError();
    } 
    else {
      console.log("getNotes error", err);
    }
      }
    }
    
  getAgent();
async function getAgent () {
    try{
     
      let data = await client.request.invokeTemplate("getAgent", {})

      let projectsObj = JSON.parse(data.response);
      // console.log("projectobj in getAgent",projectsObj);
      
      setagentName(projectsObj.contact.name);
      setagentEmail(projectsObj.contact.email)
      
        }
        catch(err){
          console.log("error in getagent func",err);
          if(err.status === 429){
            handleRateLimitError(); 
          }else{
            console.log("error in getagent func",err);
          }
        }
}
}, []);

  //////////////////Item/////////
  const handleCancelItem = () => {
    setIsItemModalOpen(false);
  };
  const handleOkItem = (cus) => {

    setArrList([cus, ...ArrList]);
    setIsItemModalOpen(true);
  };
  const onFinishItem = () => {
    setIsItemModalOpen(true);
  };

  //////////////////////
  return (
    <div style={{ marginBottom: "10px" }}> 
     {/* Display error message if there's an error */}
     {errorMessage && (
        <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
          {errorMessage}
        </div>
      )}

{ArrList && ArrList.length === 0 && !errorMessage  && (
          <div>
          <div className="content-header">
            <span
              // className={
              //   isDarkMode.modal_theme === "modalStyle_night"
              //     ? "auth_div_night"
              //     : isDarkMode.modal_theme === "modalStyle_light"
              //     ? "auth_div_light"
              //     : "auth_div_dark"
              // }
            >
              Add New Work Item
            </span>
          </div>
         
          <Button
            type="primary"
            size={Button.sizes.SMALL}
            htmlType="submit"
            onClick={onFinishItem}
            className="item-create-button"
          >
            New Work Item
          </Button>
          {configData && (
            <Modal
              maskStyle={{
                "background-color":
                   "rgb(0 0 0 / 45%)"                    
              }}
              title="Create Work Item"
              open={isItemModalOpen}
              footer={null}
              destroyOnClose
              okText={"Submit"}
              onOk={handleOkItem}
              onCancel={handleCancelItem}
              closeIcon={
                <CloseOutlined
                  style={{
                    color:"#323338",
                  }}
                />
              }
            >

            </Modal>
          )}
          
        </div>
        
      )}
      {/* ***************Over******************** */}
      {ArrList && ArrList.length > 0 && (

<CardExpand ArrList={ArrList} displayID={displayID} azure_url={azure_url} FreshdeskURL={FreshdeskURL} agentName={agentName} agentEmail={agentEmail}  handleRateLimitError ={handleRateLimitError } />
      )}

    </div>
  );
};
const CardExpand = ({ ArrList,handleRateLimitError  }) => {
  const [landingloadings, setLandingloadings] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [CommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [modalData, setmodalData] = useState([]);
  const [azureDetails, setazureDetails] = useState([]);
  const [arrList, setArrList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");  
  const [errorData, setErrorData] = useState("");  

  useEffect(() => {
    
    if (ArrList.length > 0) {
      
      if (Array.isArray (ArrList)) {
        iterationFunc()

          async function iterationFunc(){

        setArrList(ArrList);
        Promise.allSettled(eachIteration(ArrList, handleRateLimitError))
        .then((results) => {
          console.log("Promise.allSettled Results:", results); 

          let successData = results
          
            .filter(res => res.status === "fulfilled" && res.value.status === 200) 
            .map(res => res.value.response);
            let errorData = results
            .filter(res => res.status === "rejected" || (res.value && res.value.status !== 200))
            .map(res => ({
              id: res.reason?.workItemId || "Unknown",
              status: "error",
              message: res.reason?.message || `The current access token does not have permissions to fetch work item ${res.reason?.workItemId}.`
            }));

          console.log("successData",successData);
          console.log("Error Data:", errorData);

            const combinedBulkData = successData.map(item => {
              // const projectId = item.response._links.self.href.split('/')[4]; // Extract projectId from the URL
              const selfLink = item._links.self.href;
      // console.log("selflink",selfLink);
      const match = selfLink.match(/\/([^/]+)\/([^/]+)\/_apis/);
      const projectId = match ? match[2] : null; 
      // console.log("projectid in unlink",projectId);
              return {
                id: item.id,
                projectId: projectId
              };
            });
            setLandingloadings(false);
            setazureDetails([...successData, ...errorData]);
            setErrorData(errorData)
            setArrList(combinedBulkData);
              // if (e[0].status !== 401) {

              //   setazureDetails(e);
              // }
              
          })
          
          .catch((err) => {
            setLandingloadings(false);
            console.log("eachIteration_error", err);
            if (err.status === 429) {
              handleRateLimitError(); 
            } else {
              console.log("eachIteration_error", err);
            }
            return [];
          });
          console.log("arrList: ", ArrList); 

        }
      }
    
  }
  }, []);
  const handleCancelItem = () => {
    setIsItemModalOpen(false);
  };
  const handleOkItem = (cus) => {

    setArrList([cus, ...arrList]);

    let query = `https://${db_config.azuredomain}/${db_config.project_id}/_apis/wit/workitems/${cus}?api-version=5.1`; //

    AzureGetWorkItem(query, db_config)
      .then((name) => {
        if (name !== 401) {
          setazureDetails([{ name }, ...azureDetails]);
          setLandingloadings(false);
        } else {
          setLandingloadings(false);
        }
      })
      .catch((err) => {
        // console.log("err...",err);
        //reject(err);
      }); // to fetch Item details

    setIsItemModalOpen(true);
    handleCancelItem();
  };
  const onFinishItem = () => {
    setIsItemModalOpen(true);
  };
  //////////////////////
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleOk = () => {
    setIsModalOpen(true);
  };
  const handleCancelComment = () => {
    setIsCommentModalOpen(false);
  };
  const handleOkComment = () => {
    setIsCommentModalOpen(true);
  };

  const genExtra = (id) => {
    const projectDetails = azureDetails.map(item => {
      const selfLink = item.url || "";
      // console.log("selflink",selfLink);
      const match = selfLink.match(/\/([^/]+)\/([^/]+)\/_apis/);
      const projectId = match ? match[2] : null; 
      // console.log("projectid in unlink",projectId);
      return {
        id: item.id,
        projectId: projectId
      };
    });
    
    return(
    <div
      onClick={(event) => {
        setmodalData(id);
        setIsModalOpen(true);
        event.stopPropagation();
      }}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "10px", 
        marginLeft: "10%",
        justifyContent: "flex-start"
      }}
    >
      <p
        className="view-comments"
        style={{
          color: db_config.theme === "light" ? "rgb(71, 88, 103)" : "#9699a6",
          margin: 0, 
        }}
      >
        #{id}
      </p>
      <FwTooltip content="View Comments" placement="top">
  <span >
    <Icon
      onClick={(event) => {
        event.stopPropagation();
        view_comments(id, projectDetails); 
      }}
      icon={Forum}
      style={{
        color: db_config.theme === "light" ? "rgb(71, 88, 103)" : "#9699a6",
        cursor: "pointer",marginTop: "7px"
      }}
    />
  </span>
</FwTooltip>
    </div>
    )
  };
  
  const add_comments = () => {
    setIsCommentModalOpen(true);

    client.interface.trigger("showModal", {
      title: "Comment Connected Work Items",
      template: "index.html",
      data: {modalID: 'ModalTwo',
    bulkdata: arrList}
    }).then(function(data) {
      console.log(data);
    // data - success message
    }).catch(function(error) {
    // error - error object
    console.log(error);
    });
  };
  const view_comments = (id, projectDetails) => {
    console.log("work item details page...");
  
    // Filter project details based on the provided id
    const filteredProject = projectDetails.find(item => item.id === id);
  
    // If the project is found, pass it to the modal
    if (filteredProject) {
      client.interface.trigger("showModal", {
        title: "Work Items Details",
        template: "index.html",
        data: {
          modalID: 'ModalThree',
          modalData: filteredProject // Pass the filtered project details
        }
      }).then(function(data) {
        console.log(data);
        // data - success message
      }).catch(function(error) {
        console.log(error);
      });
    } else {
      console.log('No matching project found');
    }
  };
  client.instance.receive((event) => {
    console.log("received data from modal",event);
    
    if (event.data && event.data.message) {
        console.log("Received message:", event.data.message);
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
          }
           else if (event.data.message === "rateLimitError") {
                      handleRateLimitError();
        }
        else {
            console.log("Received unexpected status:", event.data.status);
        }
    }
});
console.log("azureDetails",azureDetails);

  return (
    <div>
      
      {/* ***************Over******************** */}
{/* Error Message for Rate Limit Exceeded */}
{errorMessage && (
      <div style={{textAlign: "center", marginTop: "20px" }}>
        {errorMessage}
      </div>
    )}
      {landingloadings && !errorMessage  && (
        <div style={{ textAlign: "center", marginTop: "50%", marginLeft: "45%" }}>
          {" "}
          <Loader color="var(--primary-color)" size={24} />
        </div>
      )}
{azureDetails && azureDetails.length > 0 && azureDetails.some(e => e.status !== "error") && (     
     <div className="content-header">
          <div className="list-connect-wi-label"
            style={{ marginBottom: "5px" }}
          >
            Connected Work Items
          </div>
          <div>
            <Button
              onClick={add_comments}
              defaultTextColorOnPrimaryColor={"#1f76c2"}
              leftIcon={Forum}
              kind={Button.kinds.PRIMARY}
              size={Button.sizes.SMALL}
            >
              Add Comments
            </Button>
          </div>
          
        </div>
      )}

     {!landingloadings && !errorMessage && azureDetails && azureDetails.length === 0 && (
      
        <h3>No Past Connected Work Item</h3>
      )}
      {azureDetails.length > 0 && (
  <Collapse className={"test"} defaultActiveKey={["0"]}>
    {azureDetails.map((e) => {
      // Check if the object is an error message instead of a valid work item
      if (e.status === "error") {
        return (
          <Panel
            className={"test error-panel"}
            header={
              <span>
                #{e.id}
              </span>
            }
            key={e.id}
            showArrow={false}
          >
            <div>{e.message}</div>
          </Panel>
        );
      }

      return (
        <Panel
          className={"test"}
          key={e.id}
          header={
            <span
              style={{
                whiteSpace: "normal",
                wordWrap: "break-word",
                // wordBreak: "break-all",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
                maxWidth: "70%",
              }}
            >
              {e.fields?.["System.Title"]}
            </span>
          }
          extra={genExtra(e.id)}
          showArrow={false}
        >
          <div>
            <span className="card-header">Type:</span>
            <span className="label">{e.fields?.["System.WorkItemType"]}</span>{" "}
            <br />
          </div>
          <div>
            <span className="card-header">Project:</span>
            <span className="label">{e.fields?.["System.TeamProject"]}</span>{" "}
            <br />
          </div>
          <div>
            <span className="card-header">State:</span>
            <span className="label">{e.fields?.["System.State"]}</span>{" "}
            <br />
          </div>
          <div>
            <span className="card-header">Assignee:</span>
            <span className="label">
              {e.fields?.["System.AssignedTo"]
                ? e.fields["System.AssignedTo"].displayName
                : "Nil"}
            </span>{" "}
            <br />
          </div>
          <div>
            <span className="card-header">Description:</span>
            <div
              className="galleryInner"
              style={{
                backgroundSize: "cover",
                height: "auto",
                width: "auto",
                overflow: "auto",
              }}
              dangerouslySetInnerHTML={{
                __html: e.fields?.["System.Description"] || "Nil",
              }}
            ></div>
          </div>
        </Panel>
      );
    })}
  </Collapse>
)}
      
    </div>
  );
};

const ListConnectedWorkItem = ({ ticketDetails, handleRateLimitError, handleAuthError  }) => {   
  // console.log("ticketDetails in listconnect ",ticketDetails);
  

  let configData = client.services.EventAPI.context.settings;

  return (
    <div>
    {configData && configData.azure_url && (
      <FetchMondayConv displayID={ticketDetails.id} handleRateLimitError ={handleRateLimitError } handleAuthError={handleAuthError} />
    )}
  </div>
  );
};
export default ListConnectedWorkItem;
