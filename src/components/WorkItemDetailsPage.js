import React from "react";
import { useState, useEffect,useContext,useCallback } from "react";
import Button from "monday-ui-react-core/dist/Button";
import { Input,Form,Spin} from 'antd';

import Context from '../authorization/Context';
//theme
import { ConfigProvider, theme } from "antd";
//monday.com Toast(success modal)
import {Toast} from "monday-ui-react-core";

const { TextArea } = Input;

// ************* text editor *************
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "../styles/workitemdetails.css";

export const AzureWorkItemComments= (handleAzureData) =>{
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
    let FreshdeskURL = client.services.EventAPI.context.settings.domain;


  const db_config = useContext(Context);
  //theme
  const { defaultAlgorithm, darkAlgorithm } = theme;
  var isDarkMode;     
  if(db_config.theme === "light"){
      isDarkMode = "false";
  }else if(db_config.theme === "dark"){
      isDarkMode = "true";
  }else if(db_config.theme === "black"){
      isDarkMode = "black";
  }    
    const [loadings, setLoadings] = useState(false);
    const [landingloadings, setLandingloadings] = useState(true);
    const [optionForProject, setProject] = useState();    
    const [mondayInfo, setMondayInfo] = useState({});  
    
    //Toast
    const [toastSuccOpen, setToastSuccOpen] = useState(false);
    const [toastErrOpen, setToastErrOpen] = useState(false);     
    const [toastNote, setToastNote] = useState();    
    const onCloseCallback = useCallback(() => setToastSuccOpen(false), [setToastSuccOpen]); 
    const onCloseErrCallback = useCallback(() => setToastErrOpen(false), [setToastErrOpen]);


    const [ticketID, setticketID] = useState();
    const [agentName, setagentName] = useState();
    const [agentEmail, setagentEmail] = useState();
      
    useEffect(() => {
      getComments();

       async function getComments(){

        try {
          let data = await client.request.invokeTemplate("GetALLComments", {
              context:{
                  "id": handleAzureData.props.id,
                  "project": handleAzureData.props.projectId
              }
          })
          let parseResponse = JSON.parse(data.response)
          let cus = parseResponse.comments;
          // console.log("comments",cus);
          // console.log("comments",cus[1].text);
          
          if(parseResponse.totalCount>0){           
            setTimeout(function(){
              setProject(cus.map((e,index)=>({key:"<div class='galleryInner' style='color:black;backgroundSize:cover;height:auto;width:auto;overflow:auto'>"+e.text+"</div>",name:"<strong style='color:black;'>Commented by "+e.createdBy.displayName+"</strong><br>"+"<p>Date&Time:"+e.createdDate+"</p><br>"+e.text,sno:index+1, by:e.createdBy.displayName,date_time:e.createdDate})));
              setLandingloadings(false);
            }, 500);
          }else{
            setLandingloadings(false);
            setProject([]);
          }
      } catch (error) {
        if (error.status === 429) {
          sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
          client.instance.send({ message: "rateLimitError" });
                            client.instance.close()
        }else{
console.log("Error in getAllComments in comments page ",error);
sendMessageToParent('error','An error occurred while adding comment in Azuredevops. Please try again.');
      }  
      }
    }



    client.data.get("ticket").then(
      function(data){
          setticketID(data.ticket.id)
      }
  ).catch((err) => {
      console.log(err, "error");
  })
  
  getAgent();
  async function getAgent () {
      try{
          let data = await client.request.invokeTemplate("getAgent", {})
        console.log("currentFreshdeskAgent",JSON.parse(data.response));
  
        let projectsObj = JSON.parse(data.response);
  
        setagentName(projectsObj.contact.name);
    setagentEmail(projectsObj.contact.email)
        
          }
          catch(err){
            if (err.status === 429) {
              sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
              client.instance.send({ message: "rateLimitError" });
                                client.instance.close()
            }else{
    console.log("Error in getAgent in comments page ",err);
    sendMessageToParent('error','An error occurred while adding comment in Azuredevops. Please try again.');
          }  
          }
  }
    }, []);
 
  const onFinish =async cus => {
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

    cus["text"] = tag;

console.log("handleAzureData.modalData: ", handleAzureData);
  try {
    let data = await client.request.invokeTemplate("AddComments", {
        context:{
            "modalData": handleAzureData.props.id,
            "project":handleAzureData.props.projectId
        },
        body:JSON.stringify({
            "text": tag
          })
    })
    console.log("postSingleComments",JSON.parse(data.response));

    sendMessageToParent('success','Comment added Successfully');

    client.instance.close();               

} catch (error) {
  if (error.status === 429) {
    sendMessageToParent('error','Rate limit exceeded. Please try again after 1 minute.');
    client.instance.send({ message: "rateLimitError" });
                      client.instance.close()
  }else{
console.log("Error in Addcomments in comments page ",error);
sendMessageToParent('error','An error occurred while adding comment in Azuredevops. Please try again.');
}  
}

  };
  const getComponentToRender = optionForProject => {
    // console.log("optionForProject: ", optionForProject);
    if (Array.isArray(optionForProject)) {

      if (optionForProject.length > 0)
        return optionForProject.map(e => {
          return (
            <div style={{"display": "flex", "flex-direction": "column", "fontSize": "14px", "border":"solid #dcdfe1 1px"}}>

              <p style={{"fontSize": "1.10em", "fontWeight":"bold", "marginBottom":"1px"}}>
                {e.sno}) Commented By: {e.by}
              </p>
              <p style={{"fontSize": "11px", "alignSelf": "end", "marginTop": "1px"}}>Commented Date & Time: {e.date_time}</p>
              <div dangerouslySetInnerHTML={{ __html: e.key }} />
            </div>
          );
        });
      return <div style={{"text-align": "center","color": "#d5d8df"}}>No Comments Found</div>;
    }
    return null;
  
  };
return(
  <div
  style={{
    maxHeight: "500px", 
    overflowY: "auto", 
    overflowX: "hidden", 
    border: "solid #dcdfe1 1px",
    padding: "5px", 
  }}
>
  <div>
      <Toast open={toastSuccOpen} type={Toast.types.POSITIVE}  onClose={onCloseCallback} autoHideDuration={5000} className="monday-storybook-alert-banner_small-container">
           Comment Added Successfully           
            </Toast>  
      <Toast open={toastErrOpen} type={Toast.types.NEGATIVE} onClose={onCloseErrCallback} autoHideDuration={5000} className="monday-storybook-alert-banner_small-container">
                <p>{toastNote}</p>
            </Toast>  

      <ConfigProvider theme={{
            token: {colorPrimaryBg:'#ffff',colorBgBase: '#ffff',},
            algorithm: defaultAlgorithm , 
            }}>  
                    
          <Form 
            name="basic"     
            initialValues={{ remember: true }}    
            autoComplete="off"
            onFinish={onFinish}
            >
<Form.Item  label={<span>Comments<span style={{ color: "red", marginLeft: 4 }}>*</span></span>}  name={'text'} rules={[{
                                   validator: (_, value) =>
                                     value && value.trim() !== "<p><br></p>"
                                       ? Promise.resolve()
                                       : Promise.reject(new Error("Enter the Comments")),
                                 },]}>  
                              <ReactQuill theme="snow" placeholder="Add Comments" id="text" />
                            </Form.Item>  

                <Form.Item >
                <Button type="primary" loading={loadings} style={{"float":"right"}} htmlType="submit">Send</Button>
                </Form.Item> 
            </Form>
      </ConfigProvider> 
      </div>  
       
         <div className="com-h"> 
          { landingloadings &&
              <div> <Spin size="small" /></div>                    
          }

          {getComponentToRender(optionForProject)}
          </div> 

</div>
)
};
export default AzureWorkItemComments;
