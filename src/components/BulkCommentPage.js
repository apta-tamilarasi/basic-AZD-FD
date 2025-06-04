

import React from "react";
import { useState, useEffect,useCallback } from "react";
import { Input,Form,Button} from 'antd';


import { ConfigProvider, theme } from "antd";
//monday.com Toast(success modal)
import {Toast} from "monday-ui-react-core";

// ************* text editor *************
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// import 
// const { TextArea } = Input;
var db_config={};
//theme
// var isDarkMode;
const { defaultAlgorithm } = theme;

const eachIterationNotes = (id, msg, handleAzureData) => {
    let promises = [];

    for (let j = 0; j < id.length; j++) {
        console.log(`Processing item at index ${j}:`, id[j]);

        let promise = new Promise(async (resolve, reject) => {
            try {
            //      let simulateError = true; 

            // if (simulateError) {
            //   throw { status: 429, message: "Rate limit exceeded" };
            // }

                const matchedProject = handleAzureData.props.find(item => item.id === id[j]);
                // console.log("Matched project:", matchedProject);

                if (matchedProject) {
                    // console.log("Matched project found. Making API call to add notes...");
                    let data = await client.request.invokeTemplate("addMultipleNotes", {
                        context: {
                            "modalData": id[j],
                            "project": matchedProject.projectId
                        },
                        body: JSON.stringify({
                            "text": msg
                        })
                    });

                    console.log("API response received:", data);
                    resolve(JSON.parse(data.response));
                } else {
                    console.log(`No matching project found for id: ${id[j]}`);
                    reject(`No matching project found for id: ${id[j]}`);
                }
            } catch (error) {
                    if (error.status === 429) {
                        sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                        client.instance.send({ message: "rateLimitError" });
                        client.instance.close()
                      }else{
                        console.log("Error in eachIterationNotes function of bulkcomments page:", error);
                        sendMessageToParent('error','An error occurred while adding comments in Azuredevops. Please try again.');
                    }
                reject("Error");
            }
        });

        promises.push(promise);
    }

    console.log("Returning promises array:", promises);
    return promises;
}

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
export const CommentsForAll= (handleAzureData) =>{
    // console.log("handleAzureData: ", handleAzureData);
client.instance.resize({ height: "600px" });
 
    let FreshdeskURL = client.services.EventAPI.context.settings.domain;

 //Toast
 const [toastSuccOpen, setToastSuccOpen] = useState(false);
 const [toastErrOpen, setToastErrOpen] = useState(false);    
 const [toastNote, setToastNote] = useState();    
 const onCloseCallback = useCallback(() => setToastSuccOpen(false), [setToastSuccOpen]); 
 const onCloseErrCallback = useCallback(() => setToastErrOpen(false), [setToastErrOpen]);
  
  //const user = useContext(PageDB);
    const [getDBdata1, setgetDBdata1] = useState({});
    // const [mondayInfo, setMondayInfo] = useState({});
    const [loadings, setLoadings] = useState(false);   
    // const [azureId, setAzureId] = useState();
    
    // setAzureId(handleAzureData.props[0]);

    const [ticketID, setticketID] = useState();
    const [agentName, setagentName] = useState();
    const [agentEmail, setagentEmail] = useState();

    useEffect(() => {
        setgetDBdata1({mondayItems:  handleAzureData.props.map(item => item.id)});      
        let query = `query { users (ids: [${db_config.userId}]) { name,email
            account {
              id      
              slug
            }
          }}`;
                       
        
        
        client.data.get("ticket").then(
            function(data){
                // console.log("ticket data:", data.ticket);
                // ticketID = data.ticket;
                setticketID(data.ticket.id)
                console.log("ticket ID:", data.ticket.id);

            }
        ).catch((err) => {
            console.log(err, "error");
        })
        getAgent();
        async function getAgent () {
            try{
            //     let simulateError = true; 

            // if (simulateError) {
            //   throw { status: 429, message: "Rate limit exceeded" };
            // }
                let data = await client.request.invokeTemplate("getAgent", {})
              console.log("currentFreshdeskAgent",JSON.parse(data.response));
        
              let projectsObj = JSON.parse(data.response);
              console.log("projectsObj: ", projectsObj);
              setagentName(projectsObj.contact.name);
              setagentEmail(projectsObj.contact.email)
              
                }
                catch(err){
                  if (err.status === 429) {
                    sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
                    client.instance.send({ message: "rateLimitError" });
                    client.instance.close()
                  }else{
          console.log("Error in getAgent in bulkcomments page ",error);
          sendMessageToParent('error','An error occurred while adding comments in Azuredevops. Please try again.');
                }                }
        }
        
    }, []);
    
    const onFinish = cus => {

        setLoadings(true);

        var tag = "<div class='panel panel-warning' style='border-color: #faebcc;margin-bottom: 20px;background-color: #fff;border: 1px solid transparent;border-radius: 4px;-webkit-box-shadow: 0 1px 1px rgb(0 0 0 / 5%);box-shadow: 0 1px 1px rgb(0 0 0 / 5%);font-size: 14px' data-identifyelement='352'>"+
        "<div class='panel-heading' style='color: rgb(0 0 0 / 90%);background-color: #c3d6b1d4;border-color: #faebcc;padding: 10px 15px;border-bottom: 1px solid transparent;border-top-left-radius: 3px;border-top-right-radius: 3px' data-identifyelement='353'>Comments from Freshdesk: #" +'<a href="https://' + FreshdeskURL + '/a/tickets/' + ticketID + '" target="_blank" rel="noreferrer" heap-ignore="true" data-identifyelement="358">' + ticketID + '</a>'  + " </div>" +
        "<div class='panel-body' style='padding: 15px' data-identifyelement='354'>" + cus.text +
        "</div>" +
        '<div class="panel-footer" style="padding: 10px 15px;background-color: #c3d6b157;border-top:  1px solid rgb(200 200 200);border-bottom-right-radius: 3px;border-bottom-left-radius: 3px; display: flex; align-items: center; justify-content: right;" data-identifyelement="357">' +
        ' <div class="pull-right" style="float:right" data-identifyelement="359">By: <em data-identifyelement="360">' + agentName + '"&lt;' + agentEmail + '&gt;"</em>' +
        "</div>" +
        "</div>" +
        "</div>";

        // console.log(tag);
        Promise.all(eachIterationNotes(cus.mondayItems,tag,handleAzureData)).then(function(e){ 
           if(e !== "Error"){         
                //button loader
                setLoadings(false);

                sendMessageToParent('success','Comment added Successfully');

                  client.instance.close();   
                setTimeout(function(){

                },6000);
                
            } else{   
                //button loader
                setLoadings(false);   
               
                setTimeout(function(){                   

                    setToastSuccOpen(false);
                    setToastErrOpen(true);
                }, 600);

            }
        }).catch(err=>{
            setToastNote(JSON.stringify(err));

        })
      };
return(
    <div>               
   {/* {JSON.stringify(getDBdata1)} */}
   { getDBdata1 && Object.keys(getDBdata1).length > 0  &&
   <div className="com-h" >
    
    <Toast open={toastSuccOpen} type={Toast.types.POSITIVE}  onClose={onCloseCallback} autoHideDuration={4000} className="monday-storybook-alert-banner_small-container">
           Comment Added Successfully           
    </Toast>  
    <Toast open={toastErrOpen} type={Toast.types.NEGATIVE} onClose={onCloseErrCallback} autoHideDuration={4000} className="monday-storybook-alert-banner_small-container">
          <p>{toastNote}</p>
    </Toast> 

     <ConfigProvider theme={{
            token: {colorPrimaryBg:'#ffff',colorBgBase: '#ffff',},
            algorithm: defaultAlgorithm, 
            }}>  
       
        <div style={{"padding-top": "20px"}}>     
             <Form 
                        name="basic"    
                        ref={getDBdata1} 
                        initialValues={getDBdata1}    
                        autoComplete="off"
                        onFinish={onFinish}
                        >

                             <Form.Item label="Connected Work Items" name={'mondayItems'}>                                
                                <Input className="input-style" disabled={true} id="mondayItems" />
                            </Form.Item>

<Form.Item  label={<span>Comments<span style={{ color: "red", marginLeft: 4 }}>*</span></span>} 
                                                         name={'text'} 
                                                         required={false} 
                                                         rules={[{  validator: (_, value) =>
                                                            value && value.trim() !== "<p><br></p>"
                                                              ? Promise.resolve()
                                                              : Promise.reject(new Error("Enter the Comments")),}]}>
                                           <ReactQuill theme="snow" placeholder="Add Comments" id="text" />
                            </Form.Item>                           
                            <Form.Item >
                                <Button type="primary" htmlType="submit" style={{"float":"right"}}  loading={loadings}>Send</Button>
                            </Form.Item>
            </Form>     
       
      </div>  
      </ConfigProvider> 
      </div>  
    }
</div>
)
};
export default CommentsForAll;
