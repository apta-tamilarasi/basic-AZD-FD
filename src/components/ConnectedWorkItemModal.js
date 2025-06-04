import React, { useState, useEffect } from 'react';
import './ConnectedWIModel.css'; // Importing CSS file
import { Button } from 'antd';
import { FwToastMessage } from "@freshworks/crayons/react";

var db_config={};
var conv_id =[];
var isDarkMode;

const ConnectedWorkItemModal = ({ modalData, client }) => {
  console.log("Modal data",modalData);
client.instance.resize({ height: "600px" });
  
  const sendMessageToParent = (status, content) => {
    client.instance.send({
        message: {
            status: status,
            content: content
          }
    })
    .then(() => {
        console.log("Message sent successfully!");
    })
    .catch((error) => {
        console.error("Error sending message:", error);
    });
};
  const [loading, setLoading] = useState(false);
  const [showErrorCard, setShowErrorCard] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");
    let FreshdeskURL = client.services.EventAPI.context.settings.domain;
    let azure_url = client.services.EventAPI.context.settings.azure_url;

    const [allProjectIds, setAllProjectIds] = useState([]);
    const [ticketID, setticketID] = useState();
    const [ticketcreatedAt,setticketcreatedAt]=useState();
    const [agentName, setagentName] = useState();
    const [agentEmail, setagentEmail] = useState();
    const [connectProjectId, setConnectProjectId] = useState();
    const [ticketstatus, setticketstatus] = useState();
    const [toastSuccOpen, setToastSuccOpen] = useState(false);
    // const [toastErrOpen, setToastErrOpen] = useState(false);  

    //Theme     
    if(db_config.theme === "light"){
        isDarkMode = "false";
    }else if(db_config.theme === "dark"){
        isDarkMode = "true";
    }else if(db_config.theme === "black"){
        isDarkMode = "black";
    }
    
    useEffect(() => {
      const fetchTicketData = async () => {
        try {
          const data = await client.data.get("ticket");
          // console.log("ticket data",data);
          
          setticketstatus(data.ticket.status)
          setticketID(data.ticket.id);
          setticketcreatedAt(data.ticket.created_at);
          setticketstatus(data.ticket.status);
       // Fetch notes after ticketID is set
       if (data.ticket.id) {
        getNotes(data.ticket.id);
      }
        } catch (err) {
          console.log("Error fetching ticket data:", err);
        }
      };
    
      const getAgent = async () => {
        try {
        
          let data = await client.request.invokeTemplate("getAgent", {});
          let projectsObj = JSON.parse(data.response);
      
    setagentName(projectsObj.contact.name);
    setagentEmail(projectsObj.contact.email)
        } catch (err) {
          if (err.status === 429) {
            sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
            client.instance.send({ message: "rateLimitError" });
            client.instance.close();
          }else{
            sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
          console.log("Error fetching agent data:", err);
        }}
      };
      const getNotes = async (ticketID) => {
        let allConversations = [];
        let page = 1;
        let hasMorePages = true;
        
        try {
          // let simulateError = true; 

          // if (simulateError) {
          //   throw { status: 429, message: "Rate limit exceeded" };
          // }
          while (hasMorePages) {
            let data = await client.request.invokeTemplate("fetchConversation", {
              context: {
                "ticket_id": ticketID,
                "page": page,
              },
            });
      
            let projectsObj = JSON.parse(data.response);
            console.log("getNotes response (page " + page + "):", projectsObj);
            
            allConversations = [...allConversations, ...projectsObj];
            
            hasMorePages = projectsObj.length === 30;
            page++;
          }
          
          let conv_id_status_array = [];
          let convLength = allConversations.length;
          
          for (let i = 0; i < convLength; i++) {
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
      
          for (let i = 0; i < conv_id_status_array.length; i++) {
            let item = conv_id_status_array[i];
      
            if (item.status === "connected") {
              if (!conv_id.includes(item.id)) {
                conv_id.push(item.id);
                console.log("workitem added. Current conv_id", conv_id);
              }
            } else if (item.status === "unlinked") {
              conv_id = conv_id.filter(id => id !== item.id);
              console.log("removed workitem id. Current conv_id", conv_id);
            }
          }
      
        } catch (err) {
          if (err.status === 429) {
            sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
            client.instance.send({ message: "rateLimitError" });
            client.instance.close();
          }else{
            sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
          console.log("getNotes error:", err);
        }}
      };
      
      const getAllProjectIds = async () => {
        try {
          // let simulateError = true; 

          //   if (simulateError) {
          //     throw { status: 429, message: "Rate limit exceeded" };
          //   }
          let data = await client.request.invokeTemplate("getAzureProjects", {});
          let response = JSON.parse(data.response);
          let projRes = response.value;
          let projectIdArray = projRes.map(proj => proj.id);
          setAllProjectIds(projectIdArray);
        } catch (error) {
          if (error.status === 429) {
            sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
            client.instance.send({ message: "rateLimitError" });
            client.instance.close()
          }else{
            sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
          console.log("Error fetching project IDs:", error);
        }}
      };
    
      fetchTicketData();
      getAgent();
      getAllProjectIds();
    }, []); // Empty dependency array to run only once when component mounts
    
const handleConnect = async () => {
  setLoading(true);
  
  const workItemID = String(modalData.id);
  
  // Check if the work item ID already exists in conv_id
  let exist_linked = conv_id.includes(workItemID);
  
  if (exist_linked) {
      setLoading(false);
      setErrorMessage(`Work Item #${workItemID} is already connected with this Ticket.`);
      setShowErrorCard(true);
  }
  else{
    setShowErrorCard(false); 
    setErrorMessage("");
      var connectedProjectId
      let connectWorkItemId = modalData.id;

      try{
        // let simulateError = true; 
        //         if (simulateError) {
        //           throw { status: 429, message: "Rate limit exceeded" };
        //         }
          let workItemData = await client.request.invokeTemplate("getAzureWorkItems", {
              context:{
                  cus_workItem_id: connectWorkItemId
              }
          })
          // console.log("getAzureWorkItems", workItemData.response);
          let parseResponse = JSON.parse(workItemData.response)
          let connectWorkItemUrl = parseResponse.url
          let regex2 = /([a-fA-F0-9\\-]{8})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{12})/
          setConnectProjectId(connectWorkItemUrl.match(regex2)[0])
          connectedProjectId = connectWorkItemUrl.match(regex2)[0]

      }
      catch(error){
        if (error.status === 429) {
          sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
          client.instance.send({ message: "rateLimitError" });client.instance.close();
        }else{
          sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
console.log("getAzureWorkItems error: ",error);
      }}

      var tag = "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>"+
      "<div class='panel-heading' style='color: rgb(0 0 0 / 90%);background-color: #c3d6b1d4;border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Comments from Freshdesk: #" + ticketID + " </div>" +
      "<div class='panel-body' style='padding: 15px' data-identifyelement='354'>" + "<strong data-identifyelement='355'>Freshdesk:&nbsp;</strong>&nbsp;" +
      "<a href='https://" + FreshdeskURL + "/a/tickets/" + ticketID + "' target='_blank' rel='noreferrer' heap-ignore='true' data-identifyelement='356'>#" + ticketID + "</a>&nbsp;connected successfully." +
      "</div>" +
      '<div class="panel-footer" style="padding: 10px 15px;background-color: #c3d6b157;border-top:  1px solid rgb(200 200 200);border-bottom-right-radius: 3px;border-bottom-left-radius: 3px" data-identifyelement="357">' +
      ' <div class="pull-right" data-identifyelement="359">By: <em data-identifyelement="360">' + agentName + '"&lt;' + agentEmail + '&gt;"</em>' +
      "</div>" +
      "</div>" +
      "</div>";

      let body_new = {
          "text": tag//"Hello from APP comment"
      };

      let query=`https://${db_config.azuredomain}/${db_config.project_id}/_apis/wit/workItems/${modalData.id}/comments?api-version=5.1-preview.3`;
      

      let convBody = "<div type='hidden' id='replyOrNotes' name='replyOrNotes' value='3487'> " + tag + " </div>"
      try {
        // let simulateError = true; 
        // if (simulateError) {
        //   throw { status: 429, message: "Rate limit exceeded" };
        // }
          let data = await client.request.invokeTemplate("AddComments", {
              context:{
                  "modalData": modalData.id,
                  "project": connectedProjectId
              },

              body:JSON.stringify({
                  "text": convBody
                })
          })
          let parseResponse = JSON.parse(data.response);
          console.log("postSingleComments",parseResponse);
          let parseResponseUrl = parseResponse.url
          let workItemProjectId;
          if(data.status == 200){

              //  form.resetFields();

               let regex1 = /([a-fA-F0-9\\-]{8})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{4})-([a-fA-F0-9\\-]{12})/

               for (let k = 0; k < allProjectIds.length; k++) {
                   let loopingData = allProjectIds[k];
                   if(loopingData.match(regex1)[0] === parseResponseUrl.match(regex1)[0]){
                      workItemProjectId =loopingData.match(regex1)[0]
                   }
                   
               }   

               mondayAddNote(parseResponse.workItemId, connectedProjectId); 
               sendMessageToParent('success','Work Item Connected successfully');
              // Close the modal
              client.instance.close();
            
          }

      } catch (error) {
        if (error.status === 429) {
          sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
          client.instance.send({ message: "rateLimitError" });
          client.instance.close()
          
        }else{
          sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
          console.log("error in connecting workitem",error.response);
      }}
    } 
}
const mondayAddNote = async (id, connectedProjectId) => {
  
  var msg1 = '<div style="display:none">' + azure_url + '</div>' +
      "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>" +
      "<div class='panel-heading' style='color: #183247;background-color: rgba(222,236,249,1);border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Azure DevOps Integration:</div>" +
      "<div class='panel-body' style='padding: 15px;background-color:rgba(222,236,249,1)' data-identifyelement='354'>" +
      "<strong data-identifyelement='355' id='project_id_" + connectedProjectId + "'>Work Item:&nbsp;</strong>&nbsp;" +
      "<a href='https://" + azure_url + "/_workitems/edit/" + id + "' target='_blank' rel='noreferrer' heap-ignore='true' data-identifyelement='356'>#" + id + "</a>&nbsp;connected successfully." +
      "</div>";

  let data1 = {
      "body": msg1,
      "private": true
  };

  try {
      let data = await client.request.invokeTemplate("freshdeskPrivateNotes", {
          context: {
              "ticket_id": ticketID
          },
          body: JSON.stringify(data1)
      });

      let projectsObj = JSON.parse(data.response);
      console.log("response in freshdesk notes",projectsObj);
      
      setLoading(false);

  } catch (err) {
      // console.log(err);

      if (err.status === 429) {
        sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
        client.instance.send({ message: "rateLimitError" });
        client.instance.close();
          setTimeout(() => {
              mondayAddNote(id, connectedProjectId);
          }, 60000); 
      } else {
        sendMessageToParent('error','An error occurred while connecting the work item. Please try again.');   
        console.log("error in addnotes of connect workitem",err);
        
      }
  }
};

  if (loading) {
    return <p style={{ fontSize: '18px', textAlign: 'center' }}>Loading...</p>;
  }

  return (
    <div>
    <div className="modal-content">
              <FwToastMessage id="type_toast"></FwToastMessage>

     {/* <fw-toast-message id="type_toast"></fw-toast-message> */}

      <p className="connectWILabel">Connect Work Item to Ticket: #{ticketID}</p>
      {modalData && (
        <div className="work-item-details">
          <p><strong>Work Item ID:</strong> <span className="detail">{modalData.id}</span></p>
          <p><strong>Work Item Type:</strong> <span className="detail">{modalData.type}</span></p>
          <p><strong>Project:</strong> <span className="detail">{modalData.project}</span></p>
          <p><strong>Project Title:</strong> <span className="detail">{modalData.projectTitle}</span></p>
          <p><strong>State:</strong> <span className="detail">{modalData.state}</span></p>
          <p><strong>Assignee:</strong> <span className="detail">{modalData.assignee}</span></p>
          <p><strong>Description:</strong></p>
          <div className="detail" dangerouslySetInnerHTML={{ __html: modalData.description }} />
        </div>
      )}
      {showErrorCard && (
        <div className="error-card">
          <div className="panel panel-warning">
            <div className="panel-heading">
              <strong>Error:</strong>
            </div>
            <div className="panel-body">{errorMessage}</div>
          </div>
        </div>
      )}
      
    </div>
    <div className="modal-buttons">
    <Button type="default" onClick={() => client.instance.close()} style={{ marginRight: "20%" }}>Cancel</Button>
    <Button type="primary" onClick={handleConnect}>Connect</Button>
  </div></div>
  );
}
export default ConnectedWorkItemModal;
