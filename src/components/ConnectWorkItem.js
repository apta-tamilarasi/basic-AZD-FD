import React from "react";
import { useState, useEffect,useContext,useCallback } from "react";

import { InputNumber, Form } from 'antd';
import Button from "monday-ui-react-core/dist/Button";
import {Toast} from "monday-ui-react-core";

//Theme
import { ConfigProvider, theme } from "antd";


import { FwLabel } from "@freshworks/crayons/react";

import { Tooltip } from "antd";


import '../styles/azure.css'

import '../styles/ConnectWorkItem.css'
var db_config={};

const { defaultAlgorithm, darkAlgorithm } = theme;
var isDarkMode;
// var conv_id =[];

const ConnectAzure = (props) => {  
    console.log("props in ConnectAzure",props);
    let azure_url = client.services.EventAPI.context.settings.azure_url;

    const [workItemDetails, setWorkItemDetails] = useState(null);
    const [form] = Form.useForm();
    const [ticketID, setticketID] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (props.ticketDetails?.id) {
        setticketID(props.ticketDetails.id);
      }
    }, [props.ticketDetails]);    //Theme     
    if(db_config.theme === "light"){
        isDarkMode = "false";
    }else if(db_config.theme === "dark"){
        isDarkMode = "true";
    }else if(db_config.theme === "black"){
        isDarkMode = "black";
    }
   
  const detailsModal = async (props) => {
    
    try {
      // let simulateError = true; 

      //       if (simulateError) {
      //         throw { status: 429, message: "Rate limit exceeded" };
      //       }
      setLoading(true);
      // Fetch work item details
      const data = await client.request.invokeTemplate("getWorkitemDetails", {
        context: {
          "workitem_Id": props.WorkItem,
        },
      });
  
      // Parse the work item response
      const workItem = JSON.parse(data.response);
      const fields = workItem.fields;
      
  
      // Create work item details object
      const workItemDetails = {
        id: props.WorkItem,
        type: fields["System.WorkItemType"] || "",
        project: fields["System.TeamProject"] || "",
        projectTitle: fields["System.Title"] || "",
        state: fields["System.State"] || "",
        assignee: fields["System.AssignedTo"] ? fields["System.AssignedTo"].displayName : "Nil",
        description: fields["System.Description"] || "Nil",
      };
      // console.log("workitemDetails",workItemDetails);
      
      // Set work item details in state
      setWorkItemDetails(workItemDetails);
  
      // Show the modal with work item details
      await client.interface.trigger('showModal', {
        title: 'Work Item Details',
        template: 'index.html',
        data: { modalID: 'Modelfour', modalData: workItemDetails },
      });
      form.resetFields();
      client.instance.receive((event) => {
        console.log("received data from createworkitem modal",event);
        
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
            } else {
                console.log("Received unexpected status:", event.data.status);
            }
        }
    });
    
    } catch (error) {
      console.error("Error fetching work item details:", error);
      // Check if the error response includes "was not found"
      if(error.status === 429){
        client.interface.trigger("showNotify", {
          type: "danger",
          message: "Rate limit exceeded. Please try again after 1 minute."
      });  
      }
     else if (error.response.includes("was not found")||error.response.includes("does not exist")) {
      client.interface.trigger("showNotify", {
        type: "danger",
        message: `Work Item ${props.WorkItem} does not exist`
    });
    }
    else {
      // Handle other error types
      client.interface.trigger("showNotify", {
        type: "danger",
        message: "An error occurred while fetching work item details."
    });
    }
    } finally {
      setLoading(false);
    }
  }; 
    return (
        <div>
          <Form 
            form={form} 
            name="work-item-form" 
            onFinish={detailsModal}
            initialValues={{ remember: true }}
            autoComplete="off"
        requiredMark={false}
          >
            <Tooltip placement="bottomRight" title="Please fill out this field.">
              <div className="connectWIInput">
                <Form.Item 
              label={<span>Work Item ID<span style={{ color: "red", marginLeft: 4 }}>*</span></span>} 
              name="WorkItem" 
                  rules={[
                    { 
                      required: true, 
                      message: 'Enter a Valid Work Item ID',
                    },
                    {
                      validator: (_, value) => {
                        if (!value) {
                          return Promise.resolve();
                        }
                        if (!/^\d+$/.test(value)) {
                          return Promise.reject(
                            "Enter a valid Work Item ID"
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="Enter a Work Item ID" onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}/>
                </Form.Item>
              </div>
            </Tooltip>
            <div className="connectWIButton">
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Search
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      );
};
export default ConnectAzure;